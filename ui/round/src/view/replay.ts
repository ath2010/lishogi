import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';
import * as round from '../round';
import throttle from 'common/throttle';
import * as game from 'game';
import * as status from 'game/status';
import { game as gameRoute } from 'game/router';
import viewStatus from 'game/view/status';
import * as util from '../util';
import RoundController from '../ctrl';
import { Step, MaybeVNodes, RoundData } from '../interfaces';
import { notationStyle } from 'common/notation';
import { opposite, toBlackWhite, toBW } from 'shogiops/util';

const scrollMax = 99999,
  moveTag = 'm2';

const autoScroll = throttle(100, (movesEl: HTMLElement, ctrl: RoundController) =>
  window.requestAnimationFrame(() => {
    if (ctrl.data.steps.length < 5) return;
    let st: number | undefined = undefined;
    if (ctrl.ply < 1) st = 0;
    else if (ctrl.ply == round.lastPly(ctrl.data)) st = scrollMax;
    else {
      const plyEl = movesEl.querySelector('.active') as HTMLElement | undefined;
      if (plyEl)
        st = window.lishogi.isCol1()
          ? plyEl.offsetLeft - movesEl.offsetWidth / 2 + plyEl.offsetWidth / 2
          : plyEl.offsetTop - movesEl.offsetHeight / 2 + plyEl.offsetHeight / 2;
    }
    if (typeof st == 'number') {
      if (st == scrollMax) movesEl.scrollLeft = movesEl.scrollTop = st;
      else if (window.lishogi.isCol1()) movesEl.scrollLeft = st;
      else movesEl.scrollTop = st;
    }
  })
);

function renderMove(step: Step, curPly: number, orEmpty: boolean, color: Color, notation: number) {
  return step
    ? h(
        moveTag,
        {
          class: { active: step.ply === curPly },
        },
        notationStyle(notation)({
          san: step.san,
          uci: step.uci,
          fen: step.fen.split(' ').length > 1 ? step.fen : step.fen + ' ' + toBW(color),
        })
      )
    : orEmpty
    ? h(moveTag, '…')
    : undefined;
}

export function renderResult(ctrl: RoundController): VNode | undefined {
  let result;
  if (status.finished(ctrl.data))
    switch (ctrl.data.game.winner) {
      case 'sente':
        result = '1-0';
        break;
      case 'gote':
        result = '0-1';
        break;
      default:
        result = '½-½';
    }
  if (result || status.aborted(ctrl.data)) {
    const winner = ctrl.data.game.winner;
    return h('div.result-wrap', [
      h('p.result', result || ''),
      h(
        'p.status',
        {
          hook: util.onInsert(() => {
            if (ctrl.autoScroll) ctrl.autoScroll();
            else setTimeout(() => ctrl.autoScroll(), 200);
          }),
        },
        [viewStatus(ctrl), winner ? ' • ' + ctrl.trans.noarg(toBlackWhite(winner) + 'IsVictorious') : '']
      ),
    ]);
  }
  return;
}

function renderMoves(ctrl: RoundController): MaybeVNodes {
  const steps = ctrl.data.steps,
    firstPly = round.firstPly(ctrl.data),
    lastPly = round.lastPly(ctrl.data);
  if (typeof lastPly === 'undefined') return [];
  const color = ctrl.data.game.initialFen?.split(' ')[1] == 'b' ? 'sente' : 'gote';
  const oppositeColor = opposite(color);

  const move: Array<any> = [];
  const els: MaybeVNodes = [],
    curPly = ctrl.ply;

  for (let i = 1; i < steps.length; i++) move.push(steps[i]);

  for (let i = 0; i < move.length; i++) {
    els.push(h('index', i + firstPly + 1 - ((ctrl.data.game.startedAtTurn ?? 0) % 2) + ''));
    els.push(renderMove(move[i], curPly, true, i % 2 ? color : oppositeColor, ctrl.data.pref.pieceNotation));
  }
  els.push(renderResult(ctrl));

  return els;
}

export function analysisButton(ctrl: RoundController): VNode | undefined {
  const forecastCount = ctrl.data.forecastCount;
  return game.userAnalysable(ctrl.data)
    ? h(
        'a.fbt.analysis',
        {
          class: {
            text: !!forecastCount,
          },
          attrs: {
            title: ctrl.trans.noarg('analysis'),
            href: gameRoute(ctrl.data, ctrl.data.player.color) + '/analysis#' + ctrl.ply,
            'data-icon': 'A',
          },
        },
        forecastCount ? ['' + forecastCount] : []
      )
    : undefined;
}

function renderButtons(ctrl: RoundController) {
  const d = ctrl.data,
    firstPly = round.firstPly(d),
    lastPly = round.lastPly(d);
  return h(
    'div.buttons',
    {
      hook: util.bind(
        'mousedown',
        e => {
          const target = e.target as HTMLElement;
          const ply = parseInt(target.getAttribute('data-ply') || '');
          if (!isNaN(ply)) ctrl.userJump(ply);
          else {
            const action =
              target.getAttribute('data-act') || (target.parentNode as HTMLElement).getAttribute('data-act');
            if (action === 'flip') {
              if (d.tv) location.href = '/tv/' + d.tv.channel + (d.tv.flip ? '' : '?flip=1');
              else if (d.player.spectator) location.href = gameRoute(d, d.opponent.color);
              else ctrl.flipNow();
            }
          }
        },
        ctrl.redraw
      ),
    },
    [
      h('button.fbt.flip', {
        class: { active: ctrl.flip },
        attrs: {
          title: ctrl.trans.noarg('flipBoard'),
          'data-act': 'flip',
          'data-icon': 'B',
        },
      }),
      ...[
        ['W', firstPly],
        ['Y', ctrl.ply - 1],
        ['X', ctrl.ply + 1],
        ['V', lastPly],
      ].map((b, i) => {
        const enabled = ctrl.ply !== b[1] && b[1] >= firstPly && b[1] <= lastPly;
        return h('button.fbt', {
          class: { glowing: i === 3 && ctrl.isLate() },
          attrs: {
            disabled: !enabled,
            'data-icon': b[0],
            'data-ply': enabled ? b[1] : '-',
          },
        });
      }),
      analysisButton(ctrl) || h('div.noop'),
    ]
  );
}

function initMessage(d: RoundData, trans: TransNoArg) {
  return game.playable(d) && d.game.turns === 0 && !d.player.spectator
    ? h('div.message', util.justIcon(''), [
        h('div', [
          trans(d.player.color === 'sente' ? 'youPlayTheBlackPieces' : 'youPlayTheWhitePieces'),
          ...(d.player.color === 'sente' ? [h('br'), h('strong', trans('itsYourTurn'))] : []),
        ]),
      ])
    : null;
}

function col1Button(ctrl: RoundController, dir: number, icon: string, disabled: boolean) {
  return disabled
    ? null
    : h('button.fbt', {
        attrs: {
          disabled: disabled,
          'data-icon': icon,
          'data-ply': ctrl.ply + dir,
        },
        hook: util.bind('mousedown', e => {
          e.preventDefault();
          ctrl.userJump(ctrl.ply + dir);
          ctrl.redraw();
        }),
      });
}

export function render(ctrl: RoundController): VNode | undefined {
  const d = ctrl.data,
    col1 = window.lishogi.isCol1(),
    moves =
      ctrl.replayEnabledByPref() &&
      h(
        'div.moves',
        {
          hook: util.onInsert(el => {
            el.addEventListener('mousedown', e => {
              let node = e.target as HTMLElement;
              if (node.tagName !== moveTag.toUpperCase()) return;
              while ((node = node.previousSibling as HTMLElement)) {
                if (node.tagName === 'INDEX') {
                  ctrl.userJump(parseInt(node.textContent || '') + ((ctrl.data.game.startedAtTurn ?? 0) % 2));
                  ctrl.redraw();
                  break;
                }
              }
            });
            ctrl.autoScroll = () => autoScroll(el, ctrl);
            ctrl.autoScroll();
            window.addEventListener('load', ctrl.autoScroll);
          }),
        },
        renderMoves(ctrl)
      );
  return ctrl.nvui
    ? undefined
    : h(
        'div.rmoves',
        {
          class: { impasse: ctrl.impasseHelp },
        },
        [
          renderButtons(ctrl),
          initMessage(d, ctrl.trans.noarg) ||
            (moves
              ? col1
                ? h('div.col1-moves', [
                    col1Button(ctrl, -1, 'Y', ctrl.ply == round.firstPly(d)),
                    moves,
                    col1Button(ctrl, 1, 'X', ctrl.ply == round.lastPly(d)),
                  ])
                : moves
              : renderResult(ctrl)),
        ]
      );
}
