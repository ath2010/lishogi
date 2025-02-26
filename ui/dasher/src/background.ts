import { h } from 'snabbdom';
import { VNode } from 'snabbdom/vnode';

import { Redraw, Close, bind, header } from './util';

export interface BackgroundCtrl {
  list: Background[];
  set(k: string): void;
  get(): string;
  getImage(): string;
  setImage(i: string): void;
  trans: Trans;
  close: Close;
}

export interface BackgroundData {
  current: string;
  image: string;
}

interface Background {
  key: string;
  name: string;
}

export function ctrl(data: BackgroundData, trans: Trans, redraw: Redraw, close: Close): BackgroundCtrl {
  const list: Background[] = [
    { key: 'light', name: trans.noarg('light') },
    { key: 'dark', name: trans.noarg('dark') },
    { key: 'transp', name: trans.noarg('transparent') },
  ];

  const announceFail = () => window.lishogi.announce({ msg: 'Failed to save background preference' });

  return {
    list,
    trans,
    get: () => data.current,
    set(c: string) {
      data.current = c;
      $.post('/pref/bg', { bg: c }, reloadAllTheThings).fail(announceFail);
      applyBackground(data, list);
      redraw();
    },
    getImage: () => data.image,
    setImage(i: string) {
      data.image = i;
      $.post('/pref/bgImg', { bgImg: i }, reloadAllTheThings).fail(announceFail);
      applyBackground(data, list);
      redraw();
    },
    close,
  };
}

export function view(ctrl: BackgroundCtrl): VNode {
  const cur = ctrl.get();

  return h('div.sub.background', [
    header(ctrl.trans.noarg('background'), ctrl.close),
    h(
      'div.selector.large',
      ctrl.list.map(bg => {
        return h(
          'a.text',
          {
            class: { active: cur === bg.key },
            attrs: { 'data-icon': 'E' },
            hook: bind('click', () => ctrl.set(bg.key)),
          },
          bg.name
        );
      })
    ),
    cur === 'transp' ? imageInput(ctrl) : null,
  ]);
}

function imageInput(ctrl: BackgroundCtrl) {
  return h('div.image', [
    h('p', ctrl.trans.noarg('backgroundImageUrl')),
    h('input', {
      attrs: {
        type: 'text',
        placeholder: 'https://',
        value: ctrl.getImage(),
      },
      hook: {
        insert: vnode => {
          $(vnode.elm as HTMLElement).on(
            'change keyup paste',
            window.lishogi.debounce(function (this: HTMLElement) {
              ctrl.setImage($(this).val());
            }, 200)
          );
        },
      },
    }),
  ]);
}

function applyBackground(data: BackgroundData, list: Background[]) {
  const key = data.current;

  $('body')
    .removeClass(list.map(b => b.key).join(' '))
    .addClass(key === 'transp' ? 'transp dark' : key);

  const prev = $('body').data('theme');
  $('body').data('theme', key);
  $('link[href*=".' + prev + '."]').each(function (this: HTMLElement) {
    var link = document.createElement('link');
    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = $(this)
      .attr('href')
      .replace('.' + prev + '.', '.' + key + '.');
    link.onload = () => setTimeout(() => this.remove(), 100);
    document.head.appendChild(link);
  });

  if (key === 'transp') {
    const bgData = document.getElementById('bg-data');
    const proxy = 'https://lishogi-proxy.vercel.app/api/?url=';
    bgData
      ? (bgData.innerHTML = 'body.transp::before{background-image:url(' + proxy + data.image + ');}')
      : $('head').append(
          '<style id="bg-data">body.transp::before{background-image:url(' + proxy + data.image + ');}</style>'
        );
  }
}

function reloadAllTheThings() {
  if (window.Highcharts) window.lishogi.reload();
}
