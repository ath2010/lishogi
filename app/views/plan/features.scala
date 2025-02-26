package views
package html.plan

import play.api.i18n.Lang

import lila.api.Context
import lila.app.templating.Environment._
import lila.app.ui.ScalatagsTemplate._

import controllers.routes

object features {

  def apply()(implicit ctx: Context) =
    views.html.base.layout(
      title = title,
      moreCss = cssTag("feature"),
      openGraph = lila.app.ui
        .OpenGraph(
          title = title,
          url = s"$netBaseUrl${routes.Plan.features().url}",
          description = "All of Lishogi features are free for all and forever. We do it for the shogi!"
        )
        .some
    ) {
      main(cls := "box box-pad features")(
        table(
          header(h1(dataIcon := "")("Website")),
          tbody(
            tr(unlimited)(
              "Play and create ",
              a(href := routes.Tournament.home())("tournaments")
            ),
            tr(unlimited)(
              "Play and create ",
              a(href := routes.Simul.home())("simultaneous exhibitions")
            ),
            tr(unlimited)(
              "Correspondence shogi with conditional premoves"
            ),
            tr(check)(
              "Standard shogi"
              // a(href := routes.Page.variantHome())("8 chess variants (Crazyhouse, Chess960, Horde, ...)")
            ),
            tr(unlimited)(
              s"Instant local $engineName analysis"
            ),
            tr(unlimited)(
              "Cloud engine analysis"
            ),
            // tr(unlimited)(
            //   a(href := "https://lishogi.org/blog/WFvLpiQAACMA8e9D/learn-from-your-mistakes")(
            //     "Learn from your mistakes"
            //   )
            // ),
            tr(unlimited)(
              a(href := "https://lishogi.org/study")(
                "Studies (shared and persistent analysis)"
              )
            ),
            tr(check)(
              a(href := routes.Learn.index())("All shogi basics lessons")
            ),
            tr(unlimited)(
              a(href := routes.Puzzle.home())("Tactical puzzles from user games")
            ),
            //tr(unlimited)(
            //  a(href := s"${routes.UserAnalysis.index()}#explorer")("Opening explorer"),
            //  " (62 million games!)"
            //),
            //tr(unlimited)(
            //  a(href := s"${routes.UserAnalysis.parseArg("QN4n1/6r1/3k4/8/b2K4/8/8/8_b_-_-")}#explorer")(
            //    "7-piece endgame tablebase"
            //  )
            //),
            tr(check)(
              "Download/Upload any game as KIF"
            ),
            tr(unlimited)(
              a(href := routes.Search.index(1))("Advanced search"),
              " through more than 400 thousand Lishogi games"
            ),
            tr(unlimited)(
              a(href := routes.Video.index())("Shogi video library")
            ),
            tr(check)(
              "Forum, teams, messaging, friends, challenges"
            ),
            tr(check)(
              "Available in ",
              a(href := "https://crowdin.com/project/lishogi")("many languages")
            ),
            tr(check)(
              "Light/dark theme, custom boards, pieces and background"
            ),
            tr(check)(
              strong("Zero ads")
            ),
            tr(check)(
              strong("No tracking")
            ),
            tr(check)(
              strong("All features to come, forever")
            )
          ),
          //header(h1(dataIcon := "")("Mobile")),
          //tbody(
          //  tr(unlimited)(
          //    "Online and offline games, with 8 variants"
          //  ),
          //  tr(unlimited)(
          //    "Bullet, Blitz, Rapid, Classical and Correspondence chess"
          //  ),
          //  tr(unlimited)(
          //    a(href := routes.Tournament.home())("Arena tournaments")
          //  ),
          //  tr(check)(
          //    s"Board editor and analysis board with $engineName"
          //  ),
          //  tr(unlimited)(
          //    a(href := routes.Puzzle.home())("Tactics puzzles")
          //  ),
          //  tr(check)(
          //    "Available in many languages"
          //  ),
          //  tr(check)(
          //    "Light and dark theme, custom boards and pieces"
          //  ),
          //  tr(check)(
          //    "iPhone & Android phones and tablets, landscape support"
          //  ),
          //  tr(check)(
          //    strong("Zero ads, no tracking")
          //  ),
          //  tr(check)(
          //    strong("All features to come, forever")
          //  )
          //),
          header(h1("Support Lishogi")),
          tbody(cls := "support")(
            st.tr(
              th(
                "Contribute to Lishogi and",
                br,
                "get a cool looking Patron icon"
              ),
              td("-"),
              td(span(dataIcon := patronIconChar, cls := "is is-green text check")("Yes"))
            ),
            st.tr(cls := "price")(
              th,
              td(cls := "green")("$0"),
              td(a(href := routes.Plan.index(), cls := "green button")("$5/month"))
            )
          )
        ),
        p(cls := "explanation")(
          strong("Yes, both accounts have the same features!"),
          br,
          "That is because Lishogi is built for the love of shogi.",
          br,
          "We believe every shogi player deserves the best, and so:",
          br,
          br,
          strong("all features are free for everybody, forever!"),
          br,
          "If you love Lishogi, ",
          a(cls := "button", href := routes.Plan.index())("Support us with a Patron account!")
        )
      )
    }

  private def header(name: Frag)(implicit lang: Lang) =
    thead(
      st.tr(th(name), th(trans.patron.freeAccount()), th(trans.patron.lishogiPatron()))
    )

  private val unlimited = span(dataIcon := "E", cls := "is is-green text unlimited")("Unlimited")

  private val check = span(dataIcon := "E", cls := "is is-green text check")("Yes")

  private def custom(str: String) = span(dataIcon := "E", cls := "is is-green text check")(str)

  private def all(content: Frag) = frag(td(content), td(content))

  private def tr(value: Frag)(text: Frag*) = st.tr(th(text), all(value))

  private val title = "Lishogi features"

  private val engineName = "Engine"
}
