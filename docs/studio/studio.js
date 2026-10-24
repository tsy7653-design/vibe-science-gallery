'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const stages = ['资料调查', '三种方案', '动态样片', '正式版审查', '上架'];
  let catalog, project, storageAvailable = true;
  const mediaEvents = [];
  const h = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key === 'text') node.textContent = value;
      else node.setAttribute(key, String(value));
    });
    children.flat(Infinity).forEach(child => {
      if (child != null) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    });
    return node;
  };
  const p = (text, className) => h('p', className ? {class: className} : {}, text);
  const link = (label, url) => h('a', {href: url, target: '_blank', rel: 'noopener noreferrer'}, label);
  const safeAsset = value => {
    const url = new URL(value, location.href);
    if (url.origin !== location.origin || !url.pathname.includes('/studio/')) throw new Error('素材必须位于 Studio 同源目录');
    return url.href;
  };
  const key = () => `vibe-studio:review:v1:${project.id}:${project.version}`;
  function readDraft() {
    try { return JSON.parse(localStorage.getItem(key()) || '{}') || {}; }
    catch { storageAvailable = false; return {}; }
  }
  function saveDraft() {
    const value = {choice: document.querySelector('input[name="preference"]:checked')?.value || '', comment: $('review-comment').value, updatedAt: new Date().toISOString()};
    try { localStorage.setItem(key(), JSON.stringify(value)); storageAvailable = true; }
    catch { storageAvailable = false; }
    $('save-state').textContent = storageAvailable ? '已保存到此浏览器 · 尚未发送' : '当前浏览器无法持久保存；本次页面仍可复制意见。';
    $('copy-status').textContent = '';
    $('copy-fallback').hidden = true;
  }
  function showImage(item) {
    $('image-title').textContent = item.title;
    $('full-image').src = safeAsset(item.image);
    $('full-image').alt = item.alt;
    $('image-credit').textContent = `${item.evidenceType} · ${item.credit}`;
    $('original-image').href = safeAsset(item.image);
    $('image-viewer').showModal();
  }
  function imageButton(item, eager = false) {
    const button = h('button', {type: 'button', class: 'image-button', 'aria-label': `放大查看：${item.title}`},
      h('img', {src: safeAsset(item.image), alt: item.alt, width: 1280, height: 720, loading: eager ? 'eager' : 'lazy'}),
      h('span', {class: 'zoom-label', 'aria-hidden': 'true'}, '放大 ↗'));
    button.addEventListener('click', () => showImage(item));
    return button;
  }
  function renderProject() {
    document.title = `${project.title} · Studio · VIBE SCIENCE`;
    const hero = project.resources.find(r => r.id === project.heroResource);
    $('project').replaceChildren(
      h('div', {class: 'project-hero'},
        h('div', {},
          h('div', {class: 'badges'}, h('span', {class: 'badge'}, project.statusLabel), h('span', {class: 'badge outline'}, project.version)),
          h('h2', {id: 'project-title'}, project.title), p(project.question, 'question'),
          p(`目标：${project.audienceGoal}`),
          p(`更新于 ${project.updatedAt}（香港时间） · ${project.durationLabel} · ${project.timeline.length} 段分镜草案`, 'metadata')),
        h('div', {class: 'hero-picture'}, imageButton(hero, true), h('span', {class: 'figure-label'}, 'Three.js 既有 Demo 实测 · 资源参考，非本片成品'))),
      h('ol', {class: 'stage-list', 'aria-label': '制作进度'}, stages.map((name, i) => h('li', {class: i === project.stageIndex ? 'current' : i < project.stageIndex ? 'complete' : ''}, name, h('small', {}, i === project.stageIndex ? '当前 · 待审核' : i < project.stageIndex ? '已完成' : '尚未开始')))),
      h('aside', {class: 'editor-note'}, h('strong', {}, project.recommendationTitle), project.recommendation));
    if (project.previews.some(clip => clip.publicApproved)) $('project').append(h('div', {class: 'feedback-actions'}, h('a', {class: 'button primary', href: '#previews'}, '观看本轮三段动态样片 ↗'), p('A / B / C 各15秒 · 另有45秒连续对比 · 不自动选定方案', 'small-note')));
  }
  function renderPlans() {
    $('visual-directions').parentElement.querySelector('summary').textContent = project.stageIndex === 2 ? '本轮采用的三种视觉表达，最终方向待选择' : '另有三种视觉方向，尚未制作或选定';
    $('visual-directions').replaceChildren(...(project.visualDirections || []).map(item => h('div', {class: 'preview-plan'}, h('h4', {}, `${item.id} · ${item.title}`), p(item.description))));
    $('plan-comparison').replaceChildren(...project.narratives.map(plan => {
      const a = h('a', {href: `#plan-${plan.id}`, 'data-open-plan': plan.id}, h('b', {}, plan.id), h('strong', {}, plan.title), h('span', {}, plan.pitch));
      a.addEventListener('click', () => { $(`plan-${plan.id}`).open = true; });
      return a;
    }));
    $('plan-cards').replaceChildren(...project.narratives.map(plan => {
      const details = h('details', {class: 'plan-card', id: `plan-${plan.id}`});
      const summary = h('summary', {}, h('span', {class: 'plan-letter'}, plan.id),
        h('div', {class: 'plan-summary'}, plan.recommended ? h('span', {class: 'recommended'}, '编导推荐 · 尚待你选择') : h('span', {class: 'recommended'}, plan.subtitle), h('h3', {}, plan.title), p(`${plan.duration} · ${plan.pitch}`)), h('span', {class: 'toggle', 'aria-hidden': 'true'}, '+'));
      const dl = h('dl');
      [['开场吸引点', plan.hook], ['讲解逻辑', plan.logic], ['物理揭示', plan.reveal], ['结尾构想', plan.ending]].forEach(([title, text]) => dl.append(h('dt', {}, title), h('dd', {}, text)));
      const clip = project.previews.find(item => item.planId === plan.id && item.publicApproved === true);
      if (clip) summary.querySelector('.plan-summary').append(p(`${clip.durationLabel}动态样片已完成 · 展开即可播放`, 'available-preview'));
      details.append(summary, h('div', {class: 'plan-content'}, clip ? h('div', {class: 'plan-preview', id: `preview-plan-${plan.id}`}, makeVideo(clip, false)) : null, dl, h('div', {class: 'pros-cons'}, h('div', {}, h('strong', {}, '为什么值得拍'), plan.pros), h('div', {}, h('strong', {}, '代价与风险'), plan.cons))));
      return details;
    }));
    const wanted = new URL(location.href).hash.match(/^#plan-([ABC])$/)?.[1];
    if (wanted && $(`plan-${wanted}`)) { $(`plan-${wanted}`).open = true; requestAnimationFrame(() => $(`plan-${wanted}`).scrollIntoView()); }
  }
  function renderTimeline() {
    $('timeline-note').textContent = project.timelineNote;
    $('timeline-list').replaceChildren(...project.timeline.map(shot => {
      const body = h('div', {class: 'shot-body'});
      [['看见什么', shot.see], ['这一刻要理解', shot.understand], ['动画与镜头', shot.motion], ['焦点与情绪', shot.mood], ['现成资源 / 必要原创', shot.production]].forEach(([title, text]) => body.append(h('h4', {}, title), p(text)));
      return h('details', {class: 'shot', id: `shot-${shot.id}`}, h('summary', {}, h('span', {class: 'shot-time'}, shot.time), h('span', {class: 'shot-title'}, shot.title)), body);
    }));
  }
  function renderResources() {
    $('resource-cards').replaceChildren(...project.resources.map(r =>
      h('article', {class: 'resource-card'}, imageButton(r), h('div', {class: 'resource-body'}, h('span', {class: 'resource-category'}, r.evidenceType), h('h3', {}, r.title), p(r.decision, 'resource-decision'), p(r.reason), h('details', {}, h('summary', {}, '改造、许可与版本'), p(r.adaptation), p(r.license), p(r.version, 'small-note'), p(r.credit, 'small-note')), h('div', {class: 'resource-links'}, link('原始来源 ↗', r.source), r.repo ? link('固定源码 ↗', r.repo) : null)))));
    $('science-risks').replaceChildren(...project.risks.map(text => h('li', {}, text)));
    $('model-note').textContent = project.model;
    $('source-list').replaceChildren(...project.sources.map(s => h('div', {class: 'source-item'}, link(s.title, s.url), h('small', {}, s.use))));
  }
  function makeVideo(clip, reference) {
    const video = h('video', {controls: '', playsinline: '', 'webkit-playsinline': '', preload: 'none', poster: safeAsset(clip.poster), 'aria-label': clip.title});
    const button = h('button', {type: 'button', class: 'load-clip', 'aria-label': `播放：${clip.title}`}, h('span', {'aria-hidden': 'true'}, '▷'), h('span', {}, reference ? '播放资源参考片段' : '播放动态样片'));
    const state = p(`点击后才加载视频 · ${reference ? '无声参考片段' : '原创轻量声音 · 无旁白'}`, 'clip-state');
    const shell = h('div', {class: 'clip-shell'}, video, button);
    for (const event of ['loadedmetadata', 'canplay', 'playing', 'waiting', 'seeked', 'error']) video.addEventListener(event, () => {
      mediaEvents.push({id: clip.id, event, currentTime: video.currentTime, error: video.error?.code || null});
      video.dataset.state = event;
      state.textContent = event === 'error' ? `视频暂未能载入（${video.error?.code || '未知错误'}），可打开 MP4 重试。` : event === 'waiting' ? '正在缓冲…' : event === 'playing' ? '正在播放 · 可拖动进度 / 使用原生全屏' : event === 'seeked' ? '已定位到所选时间' : '视频已就绪 · 原生控制可用';
    });
    button.addEventListener('click', () => {
      document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
      video.src = safeAsset(clip.src); button.hidden = true; state.textContent = '正在加载视频…';
      const play = video.play();
      play?.catch(() => { state.textContent = '请点播放器中的播放按钮继续。'; });
    }, {once: true});
    const card = h('article', {class: 'clip-card', 'data-clip-id': clip.id}, h('span', {class: 'resource-category'}, reference ? '既有资源参考 · 不是本项目生成样片' : `${clip.durationLabel} · ${clip.version} · 已完成 / 待你选择`), h('h4', {}, clip.title), p(clip.note), shell, state, link('直接打开 MP4 ↗', safeAsset(clip.src)));
    if (!reference && clip.strength) card.append(h('details', {class: 'clip-review'}, h('summary', {}, '视觉与教学取舍'), p(`优势：${clip.strength}`), p(`局限：${clip.limitation}`)));
    return card;
  }
  function renderPreviews() {
    $('next-previews').parentElement.querySelector('summary').textContent = project.stageIndex === 2 ? '本轮三段预览分别展示了什么？' : '第三轮建议制作哪些关键样片？';
    const approved = project.previews.filter(clip => clip.publicApproved === true);
    if (approved.length) {
      const shortcuts = approved.map(clip => {
        const button = h('button', {type: 'button', class: 'button secondary', 'data-play-plan': clip.planId}, `播放方案 ${clip.planId} · ${clip.durationLabel}`);
        button.addEventListener('click', () => { $(`plan-${clip.planId}`).open = true; const slot = $(`preview-plan-${clip.planId}`); slot.scrollIntoView({behavior: 'smooth', block: 'center'}); const play = slot.querySelector('.load-clip'); if (!play.hidden) play.click(); else slot.querySelector('video').play().catch(() => {}); });
        return button;
      });
      $('project-previews').replaceChildren(p('三段真实动态样片已在各自方案卡片中就位。先分别看，也可以连续对比；它们各取代表性转折，不是同一画面的换标题版本。'), h('div', {class: 'feedback-actions'}, shortcuts), project.comparison?.publicApproved ? makeVideo(project.comparison, false) : null);
    } else $('project-previews').replaceChildren(h('div', {class: 'empty-state'}, h('h3', {}, '尚无动态样片'), p('本项目目前完成了资源侦察与第二轮片前设计。下面的参考片段用于评估现有资源，不能代表本片已完成的镜头。')));
    $('next-previews').replaceChildren(...project.nextPreviews.map(item => h('div', {class: 'preview-plan'}, h('h4', {}, item.title), p(item.description))), p(project.nextGate, 'model-note'));
    $('reference-clips').replaceChildren(h('h3', {class: 'reference-heading'}, '已有的资源参考片段'), p('两个 8 秒无声片段，来自上一轮实测／官方影像；仅点按的那一段才加载。', 'reference-intro'), h('div', {class: 'clip-grid'}, project.referenceClips.filter(clip => clip.publicApproved).map(clip => makeVideo(clip, true))));
  }
  function renderVersions() {
    $('version-list').replaceChildren(...project.history.map(item => h('div', {class: 'version-row'}, h('time', {datetime: item.date}, item.date), h('div', {}, h('strong', {}, item.title), p(item.note)))));
  }
  function renderFeedback() {
    const draft = readDraft();
    const options = project.narratives.map(plan => [plan.id, `方案 ${plan.id}`]).concat([['blend', '融合方案'], ['undecided', '暂未决定']]);
    $('preference-options').replaceChildren(...options.map(([value, label]) => {
      const input = h('input', {type: 'radio', name: 'preference', value});
      input.checked = draft.choice === value;
      input.addEventListener('change', saveDraft);
      return h('label', {class: 'preference-option'}, input, label);
    }));
    $('review-comment').value = typeof draft.comment === 'string' ? draft.comment.slice(0, 2000) : '';
    $('save-state').textContent = storageAvailable ? (draft.updatedAt ? '已恢复此版本的本机草稿 · 尚未发送' : '尚未选择 · 选择和意见仅保存在此浏览器') : '当前浏览器无法持久保存；仍可复制本次意见。';
    $('copy-status').textContent = '';
    $('copy-fallback').hidden = true;
  }
  async function loadProject(id, updateUrl = false) {
    const entry = catalog.projects.find(item => item.id === id) || catalog.projects[0];
    const response = await fetch(entry.data);
    if (!response.ok) throw new Error(`项目资料暂未载入（HTTP ${response.status}）`);
    const next = await response.json();
    if (next.schemaVersion !== 1 || next.id !== entry.id) throw new Error('项目数据版本不匹配');
    project = next;
    for (const render of [renderProject, renderPlans, renderTimeline, renderResources, renderPreviews, renderVersions, renderFeedback]) render();
    $('project-select').value = project.id;
    $('project-content').hidden = false;
    $('load-status').hidden = true;
    if (updateUrl) { const url = new URL(location.href); url.searchParams.set('project', project.id); url.hash = 'project'; history.replaceState(null, '', url); }
  }
  $('review-comment').addEventListener('input', saveDraft);
  $('reset-feedback').addEventListener('click', () => { try { localStorage.removeItem(key()); } catch {} renderFeedback(); $('save-state').textContent = '本机草稿已清空；没有发送任何意见。'; });
  $('copy-feedback').addEventListener('click', () => {
    const choice = document.querySelector('input[name="preference"]:checked')?.value;
    const plan = project.narratives.find(item => item.id === choice);
    const selected = plan ? `${plan.id}｜${plan.title}` : choice === 'blend' ? '融合方案' : '暂未决定';
    const url = new URL(location.href); url.searchParams.set('project', project.id); url.hash = 'feedback';
    const text = [`VIBE SCIENCE｜Studio 反馈`, `项目：${project.title}`, `审查版本：${project.version}（${project.updatedAt}）`, `我的倾向：${selected}`, `简短意见：${$('review-comment').value.trim() || '暂无补充，请先讨论方案。'}`, `审查入口：${url.href}`, project.stageIndex === 2 ? '本反馈针对 A/B/C 动态样片；请结合意见讨论下一步，不自动开始完整版。' : '本反馈针对片前方案；尚未进行动态样片确认。'].join('\n');
    const fallback = () => {
      $('feedback-text').value = text;
      $('copy-fallback').hidden = false;
      $('feedback-text').focus(); $('feedback-text').select(); $('feedback-text').setSelectionRange(0, text.length);
      let copied = false; try { copied = document.execCommand('copy'); } catch {}
      $('copy-status').textContent = copied ? '已复制。请回到 Codex 粘贴发送。' : '浏览器未允许自动复制。请长按下方文字复制，再粘贴回 Codex。';
    };
    // Keep writeText directly inside the user gesture for iPhone Safari.
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => { $('copy-fallback').hidden = true; $('copy-status').textContent = '已复制。请回到 Codex 粘贴发送；网页不会自动提交。'; }).catch(fallback);
    else fallback();
  });
  $('close-image').addEventListener('click', () => $('image-viewer').close());
  $('image-viewer').addEventListener('click', e => { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) e.currentTarget.close(); });
  $('project-select').addEventListener('change', e => loadProject(e.target.value, true).catch(fail));
  function fail(error) { $('load-status').hidden = false; $('load-status').className = 'error'; $('load-status').textContent = `${error.message}。请稍后刷新；不会影响正式作品馆。`; }
  fetch('data/catalog.json?v=studio-r3-1').then(async response => {
    if (!response.ok) throw new Error(`目录暂未载入（HTTP ${response.status}）`);
    catalog = await response.json();
    if (catalog.schemaVersion !== 1 || !catalog.projects?.length) throw new Error('审片目录为空或版本不兼容');
    $('project-select').replaceChildren(...catalog.projects.map(item => h('option', {value: item.id}, item.title)));
    $('project-select').disabled = false;
    await loadProject(new URL(location.href).searchParams.get('project') || catalog.defaultProject);
  }).catch(fail);
  window.STUDIO = {getMediaEvents: () => mediaEvents.slice()};
})();
