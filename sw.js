// ARTEZ Staff — Service Worker
const CACHE = 'artez-staff-v1';

self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

// Web Push уведомления
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {}
  const isMeasure     = data.type === 'measure';
  const isMApproved   = data.type === 'measure_approved';
  const isMRejected   = data.type === 'measure_rejected';
  const isPosReq      = data.type === 'position_request';
  const isPosClaim    = data.type === 'position_claimed';
  const isNewItem     = data.type === 'new_item';
  const isCashHandover   = data.type === 'cash_handover';
  const isCashConfirmed  = data.type === 'cash_confirmed';
  const isNewExpense     = data.type === 'new_expense';
  const isExpenseResult  = data.type === 'expense_approved' || data.type === 'expense_rejected';
  const isPaymentReview  = data.type === 'payment_review';
  const isDebtApproval   = data.type === 'debt_approval';
  const isDebtRejected   = data.type === 'debt_rejected';
  const isDebtApproved   = data.type === 'debt_approved';
  const isDeliveryReload   = data.type === 'delivery_reload';
  const isPaymentRejected  = data.type === 'payment_rejected';
  const isNewChat        = data.type === 'new_chat';
  const isNewLead        = data.type === 'new_lead';
  const title = data.title || (
    isMeasure        ? '📐 Проверить замер' :
    isMApproved      ? '✅ Замер утверждён' :
    isMRejected      ? '❌ Замер отклонён'  :
    isPosReq         ? '📋 Запрос позиции'  :
    isNewItem        ? '📋 Новая позиция'   :
    isPosClaim       ? '✅ Принято'          :
    isCashHandover   ? '💵 Вам сдают наличные' :
    isCashConfirmed  ? '✅ Наличные получены'   :
    isNewExpense     ? '🧾 Новый запрос расхода' :
    isExpenseResult  ? (data.type === 'expense_approved' ? '✅ Расход утверждён' : '❌ Расход отклонён') :
    isPaymentReview  ? '💳 Оплата на проверку'  :
    isDebtApproval   ? '❗ Закрытие в долг'      :
    isDebtRejected   ? '❌ Запрос отклонён'      :
    isDebtApproved    ? '✅ Долг одобрен'         :
    isPaymentRejected ? '❌ Оплата отклонена'    :
    isNewChat         ? '💬 Новый чат'           :
    isNewLead        ? '🎯 Новый лид'           : '🔔 Перезвонить!');
  const body  = data.body || '';
  const url = isMeasure
            ? `/staff.html?mreview=${data.order_id}&open_item=${data.item_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isMApproved
            ? `/staff.html?mapproved=${data.order_id}&open_item=${data.item_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isMRejected
            ? `/staff.html?mrejected=${data.order_id}&open_item=${data.item_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isNewItem
            ? `/staff.html?newitem=${data.order_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isPosReq
            ? `/staff.html?posreq=${data.order_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isPaymentReview
            ? `/staff.html?payreview=${data.order_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isPaymentRejected
            ? `/staff.html?payrejected=${data.order_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isDeliveryReload
            ? `/staff.html?payconfirmed=${data.order_id}&pt=${encodeURIComponent(title)}&pb=${encodeURIComponent(body)}`
            : isNewChat
            ? `/staff.html?chat=1`
            : isNewLead
            ? '/staff.html?open_leads=new'
            : (data.lead_id ? `/staff.html?lead=${data.lead_id}` : '/staff.html');
  const options = {
    body,
    icon:    '/logo.png',
    badge:   '/logo.png',
    vibrate: isMeasure       ? [200,100,200,100,600] :
             isMApproved    ? [200,100,400]          :
             isMRejected    ? [300,150,300,150,300]  :
             isNewItem      ? [200,100,200]           :
             isPosReq       ? [300,100,300]           :
             isPosClaim     ? [100,50,100]            :
             isNewChat      ? [200,100,200,100,200]  :
             isPaymentReview? [300,100,300,100,300]   :
             isDebtApproval ? [400,150,400,150,600]    :
             isDebtRejected ? [600,200,600]             :
             isDebtApproved    ? [200,100,400]             :
             isPaymentRejected ? [600,200,600,200,600]   :
             isNewExpense      ? [200,100,200,100,200]     :
             isExpenseResult   ? [200,100,400]             :
             isNewLead         ? [300,100,300]            : [400,150,400,150,400,150,400],
    requireInteraction: true,
    tag:     isMeasure       ? `measure-${data.item_id}`        :
             isMApproved    ? `mapproved-${data.item_id}`      :
             isMRejected    ? `mrejected-${data.item_id}`      :
             isNewItem      ? `newitem-${data.order_id}`        :
             isPosReq       ? `posreq-${data.order_id}`        :
             isPosClaim     ? `posclaim-${data.order_id}`      :
             isNewChat      ? `new-chat`                        :
             isNewLead      ? `new-lead-${data.lead_id || Date.now()}` :
             isNewExpense   ? `new-expense-${data.expense_id || Date.now()}` :
             isExpenseResult? `exp-result-${data.expense_id || Date.now()}` :
             isPaymentReview? `payreview-${data.order_id}`     :
             isDebtApproval ? `debt-approval-${data.order_id || Date.now()}` :
             isDebtRejected ? `debt-rejected-${data.order_id || Date.now()}` :
             isDebtApproved    ? `debt-approved-${data.order_id || Date.now()}`    :
             isPaymentRejected ? `pay-rejected-${data.order_id || Date.now()}`    : 'callback-' + (data.lead_id || 'remind'),
    renotify: true,
    data:    { url, lead_id: data.lead_id, phone: data.phone,
               order_id: data.order_id, item_id: data.item_id, type: data.type,
               driver_staff_id: data.driver_staff_id,
               push_title: title, push_body: body },
    actions: (isMeasure || isMApproved || isMRejected || isPosReq || isNewItem || isPaymentReview)
      ? [{ action: 'open', title: '📋 Открыть заказ' }, { action: 'dismiss', title: 'Закрыть' }]
      : isNewChat
      ? [{ action: 'open', title: '💬 Открыть чат' },   { action: 'dismiss', title: 'Закрыть' }]
      : isNewLead
      ? [{ action: 'open', title: '🎯 Открыть лид' },   { action: 'dismiss', title: 'Закрыть' }]
      : [{ action: 'call', title: '📞 Позвонить' },      { action: 'dismiss', title: 'Закрыть' }],
  };
  const notifPromise = self.registration.showNotification(title, options);
  const broadcastPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    list.forEach(c => {
      if (!c.url.includes('staff.html')) return;
      if (isMeasure)       c.postMessage({ type: 'POLL_MEASURES' });
      if (isMApproved)     c.postMessage({ type: 'SHOW_MEASURE_APPROVED', order_id: data.order_id, item_id: data.item_id, title, body });
      if (isMRejected)     c.postMessage({ type: 'SHOW_MEASURE_REJECTED', order_id: data.order_id, item_id: data.item_id, title, body });
      if (isPosReq)        c.postMessage({ type: 'SHOW_POS_REQUEST', order_id: data.order_id, title, body });
      if (isPosClaim)      c.postMessage({ type: 'CLOSE_POS_REQUEST', order_id: data.order_id });
      if (isNewItem)       c.postMessage({ type: 'SHOW_NEW_ITEM', order_id: data.order_id, title, body });
      if (isPaymentReview) c.postMessage({ type: 'SHOW_PAYMENT_REVIEW', order_id: data.order_id, title, body });
      if (isCashHandover)  c.postMessage({ type: 'POLL_CASH_HANDOVER' });
      if (isCashConfirmed) c.postMessage({ type: 'REFRESH_CASH_MODAL' });
      if (isNewExpense)    c.postMessage({ type: 'POLL_EXPENSES' });
      if (isExpenseResult) c.postMessage({ type: 'REFRESH_CASH_MODAL' });
      if (isDebtApproval)  c.postMessage({ type: 'POLL_DEBT_APPROVALS' });
      if (isDebtRejected)  c.postMessage({ type: 'DEBT_RESULT', result: 'rejected', order_id: data.order_id, driver_staff_id: data.driver_staff_id, title, body });
      if (isDebtApproved)  c.postMessage({ type: 'DEBT_RESULT', result: 'approved', order_id: data.order_id, driver_staff_id: data.driver_staff_id, title, body });
      if (isDeliveryReload)   c.postMessage({ type: 'RELOAD_DELIVERY',   order_id: data.order_id });
      if (isPaymentRejected)  c.postMessage({ type: 'PAYMENT_REJECTED',  order_id: data.order_id, title, body });
      if (isNewChat)       c.postMessage({ type: 'SHOW_NEW_CHAT', title, body });
      if (isNewLead && data.lead_id) c.postMessage({ type: 'NEW_LEAD', lead_id: data.lead_id, title, body });
    });
  });
  event.waitUntil(Promise.all([notifPromise, broadcastPromise]));
});

// Сетевой приоритет для staff.html — гарантирует свежую версию на мобильных
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname === '/staff.html' || url.pathname.endsWith('/staff.html')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => caches.match(event.request))
    );
  }
});

// Клик по уведомлению
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const leadId       = event.notification.data?.lead_id;
  const phone        = event.notification.data?.phone;
  const url          = event.notification.data?.url || '/staff.html';
  const notifType    = event.notification.data?.type;
  const orderId      = event.notification.data?.order_id;
  const itemId       = event.notification.data?.item_id;
  const driverStaffId= event.notification.data?.driver_staff_id;
  const posTitle     = event.notification.data?.push_title || event.notification.title || '';
  const posBody      = event.notification.data?.push_body  || event.notification.body  || '';

  if (event.action === 'call' && phone) {
    event.waitUntil(clients.openWindow(`tel:${phone}`));
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const staffClient = list.find(c => c.url.includes('staff.html'));

      if (staffClient) {
        // iOS fix: focus() first, then postMessage after 300ms so JS context is active
        return staffClient.focus().then(() => {
          setTimeout(() => {
            if (notifType === 'measure' && orderId)
              staffClient.postMessage({ type: 'POLL_MEASURES' });
            else if (notifType === 'measure_approved' && orderId)
              staffClient.postMessage({ type: 'SHOW_MEASURE_APPROVED', order_id: orderId, item_id: itemId, title: posTitle, body: posBody });
            else if (notifType === 'measure_rejected' && orderId)
              staffClient.postMessage({ type: 'SHOW_MEASURE_REJECTED', order_id: orderId, item_id: itemId, title: posTitle, body: posBody });
            else if (notifType === 'position_request' && orderId)
              staffClient.postMessage({ type: 'SHOW_POS_REQUEST', order_id: orderId, title: posTitle, body: posBody });
            else if (notifType === 'new_item' && orderId)
              staffClient.postMessage({ type: 'SHOW_NEW_ITEM', order_id: orderId, title: posTitle, body: posBody });
            else if (notifType === 'payment_review' && orderId)
              staffClient.postMessage({ type: 'SHOW_PAYMENT_REVIEW', order_id: orderId, title: posTitle, body: posBody });
            else if (notifType === 'cash_handover')
              staffClient.postMessage({ type: 'POLL_CASH_HANDOVER' });
            else if (notifType === 'cash_confirmed')
              staffClient.postMessage({ type: 'REFRESH_CASH_MODAL' });
            else if (notifType === 'new_expense')
              staffClient.postMessage({ type: 'POLL_EXPENSES' });
            else if (notifType === 'expense_approved' || notifType === 'expense_rejected')
              staffClient.postMessage({ type: 'REFRESH_CASH_MODAL' });
            else if (notifType === 'debt_approval')
              staffClient.postMessage({ type: 'POLL_DEBT_APPROVALS' });
            else if (notifType === 'debt_rejected')
              staffClient.postMessage({ type: 'DEBT_RESULT', result: 'rejected', order_id: orderId, driver_staff_id: driverStaffId, title: posTitle, body: posBody });
            else if (notifType === 'debt_approved')
              staffClient.postMessage({ type: 'DEBT_RESULT', result: 'approved', order_id: orderId, driver_staff_id: driverStaffId, title: posTitle, body: posBody });
            else if (notifType === 'payment_rejected')
              staffClient.postMessage({ type: 'PAYMENT_REJECTED', order_id: orderId, title: posTitle, body: posBody });
            else if (notifType === 'delivery_reload')
              staffClient.postMessage({ type: 'RELOAD_DELIVERY', order_id: orderId, title: posTitle, body: posBody });
            else if (notifType === 'new_chat')
              staffClient.postMessage({ type: 'SHOW_NEW_CHAT', title: posTitle, body: posBody });
            else if (notifType === 'new_lead')
              staffClient.postMessage({ type: 'OPEN_LEADS_NEW' });
            else if (leadId)
              staffClient.postMessage({ type: 'OPEN_LEAD', lead_id: leadId });
          }, 300);
        });
      }

      // Вкладка закрыта → открываем новую, URL params прочитаются в startApp()
      return clients.openWindow(url);
    })
  );
});

