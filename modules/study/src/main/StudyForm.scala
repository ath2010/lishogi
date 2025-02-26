package lila.study

import play.api.data._
import play.api.data.Forms._

import lila.common.Form.clean

object StudyForm {

  object importGame {

    lazy val form = Form(
      mapping(
        "gameId"      -> optional(nonEmptyText),
        "orientation" -> optional(nonEmptyText),
        "fen"         -> optional(nonEmptyText),
        "kif"         -> optional(nonEmptyText),
        "variant"     -> optional(nonEmptyText),
        "as"          -> optional(nonEmptyText)
      )(Data.apply)(Data.unapply)
    )

    case class Data(
        gameId: Option[String] = None,
        orientationStr: Option[String] = None,
        fenStr: Option[String] = None,
        kifStr: Option[String] = None,
        variantStr: Option[String] = None,
        asStr: Option[String] = None
    ) {

      def orientation = orientationStr.flatMap(shogi.Color.apply) | shogi.Sente

      def as: As =
        asStr match {
          case None | Some("study") => AsNewStudy
          case Some(studyId)        => AsChapterOf(Study.Id(studyId))
        }

      def toChapterData =
        ChapterMaker.Data(
          name = Chapter.Name(""),
          game = gameId,
          variant = variantStr,
          fen = fenStr,
          kif = kifStr,
          orientation = orientation.name,
          mode = ChapterMaker.Mode.Normal.key,
          initial = false
        )
    }

    sealed trait As
    case object AsNewStudy                    extends As
    case class AsChapterOf(studyId: Study.Id) extends As
  }

  object importPgn {

    lazy val form = Form(
      mapping(
        "name"        -> clean(text),
        "orientation" -> optional(nonEmptyText),
        "variant"     -> optional(nonEmptyText),
        "mode"        -> nonEmptyText.verifying(ChapterMaker.Mode(_).isDefined),
        "initial"     -> boolean,
        "sticky"      -> boolean,
        "kif"         -> nonEmptyText
      )(Data.apply)(Data.unapply)
    )

    case class Data(
        name: String,
        orientationStr: Option[String] = None,
        variantStr: Option[String] = None,
        mode: String,
        initial: Boolean,
        sticky: Boolean,
        kif: String
    ) {

      def orientation = orientationStr.flatMap(shogi.Color.apply) | shogi.Sente

      def toChapterDatas =
        MultiPgn.split(kif, max = 20).value.zipWithIndex map { case (oneKif, index) =>
          ChapterMaker.Data(
            // only the first chapter can be named
            name = Chapter.Name((index == 0) ?? name),
            variant = variantStr,
            kif = oneKif.some,
            orientation = orientation.name,
            mode = mode,
            initial = initial && index == 0
          )
        }
    }
  }

  def topicsForm = Form(single("topics" -> text))

  def topicsForm(topics: StudyTopics) =
    Form(single("topics" -> text)) fill topics.value.map(_.value).mkString(", ")
}
