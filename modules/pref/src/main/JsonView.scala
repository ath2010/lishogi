package lila.pref

import play.api.libs.json._

object JsonView {

  implicit val prefJsonWriter = OWrites[Pref] { p =>
    Json.obj(
      "dark"            -> p.dark,
      "transp"          -> p.transp,
      "bgImg"           -> p.bgImgOrDefault,
      "is3d"            -> p.is3d,
      "theme"           -> p.theme,
      "pieceSet"        -> p.pieceSet,
      "theme3d"         -> p.theme3d,
      "pieceSet3d"      -> p.pieceSet3d,
      "soundSet"        -> p.soundSet,
      "pieceNotation"   -> p.pieceNotation,
      "blindfold"       -> p.blindfold,
      "takeback"        -> p.takeback,
      "moretime"        -> p.moretime,
      "clockTenths"     -> p.clockTenths,
      "clockCountdown"  -> p.clockCountdown,
      "clockBar"        -> p.clockBar,
      "clockSound"      -> p.clockSound,
      "premove"         -> p.premove,
      "animation"       -> p.animation,
      "captured"        -> p.captured,
      "follow"          -> p.follow,
      "highlight"       -> p.highlight,
      "destination"     -> p.destination,
      "dropDestination" -> p.dropDestination,
      "coords"          -> p.coords,
      "replay"          -> p.replay,
      "challenge"       -> p.challenge,
      "message"         -> p.message,
      "coordColor"      -> p.coordColor,
      "submitMove"      -> p.submitMove,
      "confirmResign"   -> p.confirmResign,
      "insightShare"    -> p.insightShare,
      "keyboardMove"    -> p.keyboardMove,
      "zen"             -> p.zen,
      "moveEvent"       -> p.moveEvent
    )
  }
}
