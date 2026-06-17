import React, { useState, useMemo } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppStore } from '@/store';
import { formatPrice, formatDateTime } from '@/utils';
import { Order } from '@/types';
import classnames from 'classnames';
import styles from './index.module.scss';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const orderId = router.params.id;

  const orders = useAppStore(s => s.orders);
  const billRecords = useAppStore(s => s.billRecords);
  const updateOrderStatus = useAppStore(s => s.updateOrderStatus);
  const startDelivery = useAppStore(s => s.startDelivery);
  const completeDelivery = useAppStore(s => s.completeDelivery);
  const handleReturn = useAppStore(s => s.handleReturn);

  const [activeTab, setActiveTab] = useState<'info' | 'bills'>('info');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnAction, setReturnAction] = useState<'退货' | '换货' | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [signRemark, setSignRemark] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');

  const order = useMemo(() => orders.find(o => o.id === orderId), [orders, orderId]);

  const orderBills = useMemo(() =>
    billRecords.filter(b => b.orderNo === order?.orderNo),
    [billRecords, order?.orderNo]
  );

  if (!order) {
    return (
      <View className={styles.page}>
        <View className={styles.empty}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>订单不存在</Text>
        </View>
      </View>
    );
  }

  const timeline = useMemo(() => {
    const items: { title: string; time?: string; active: boolean }[] = [
      { title: '订单创建', time: order.createTime, active: true }
    ];
    if (order.status !== '待确认' && order.status !== '已取消') {
      items.push({ title: '订单确认', time: order.createTime, active: true });
    }
    if (['定制中', '待配送', '配送中', '已完成'].includes(order.status)) {
      items.push({ title: '开始定制', active: true });
    }
    if (['待配送', '配送中', '已完成'].includes(order.status)) {
      items.push({ title: '定制完成', active: true });
    }
    if (order.deliveryTime || ['配送中', '已完成'].includes(order.status)) {
      items.push({ title: '开始配送', time: order.deliveryTime, active: true });
    }
    if (order.deliverCompleteTime || order.status === '已完成') {
      items.push({ title: '配送完成', time: order.deliverCompleteTime, active: order.status === '已完成' });
    }
    if (order.status === '已取消') {
      items.push({ title: '订单已取消', active: true });
    }
    return items;
  }, [order]);

  const getStatusActions = (order: Order) => {
    switch (order.status) {
      case '待确认':
        return [
          { label: '取消订单', className: styles.btnSecondary, action: () => handleCancel() },
          { label: '确认订单', className: styles.btnPrimary, action: () => handleConfirm() }
        ];
      case '定制中':
        return [
          { label: '标记待配送', className: styles.btnPrimary, action: () => handleMarkReady() }
        ];
      case '待配送':
        return [
          { label: '开始配送', className: styles.btnPrimary, action: () => handleStartDelivery() }
        ];
      case '配送中':
        return [
          { label: '配送完成', className: styles.btnSuccess, action: () => setShowCompleteModal(true) }
        ];
      case '退换中':
        return [
          { label: '退货处理', className: styles.btnSecondary, action: () => openReturnModal('退货') },
          { label: '换货处理', className: styles.btnPrimary, action: () => openReturnModal('换货') }
        ];
      default:
        return [];
    }
  };

  const handleConfirm = () => {
    Taro.showModal({
      title: '确认订单',
      content: '确认该定制单信息无误，开始定制？',
      success: (res) => {
        if (res.confirm) {
          updateOrderStatus(order.id, '定制中');
          Taro.showToast({ title: '订单已确认', icon: 'success' });
        }
      }
    });
  };

  const handleCancel = () => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          updateOrderStatus(order.id, '已取消');
          Taro.showToast({ title: '订单已取消', icon: 'success' });
        }
      }
    });
  };

  const handleMarkReady = () => {
    Taro.showModal({
      title: '标记待配送',
      content: '确认定制已完成，标记为待配送？',
      success: (res) => {
        if (res.confirm) {
          updateOrderStatus(order.id, '待配送');
          Taro.showToast({ title: '已标记待配送', icon: 'success' });
        }
      }
    });
  };

  const handleStartDelivery = () => {
    Taro.showModal({
      title: '开始配送',
      content: '确认开始配送该订单？',
      success: (res) => {
        if (res.confirm) {
          startDelivery(order.id);
          Taro.showToast({ title: '已开始配送', icon: 'success' });
        }
      }
    });
  };

  const openReturnModal = (action: '退货' | '换货') => {
    setReturnAction(action);
    setReturnReason('');
    setRefundAmount(order.paidAmount.toString());
    setShowReturnModal(true);
  };

  const handleReturnSubmit = () => {
    if (!returnReason.trim()) {
      Taro.showToast({ title: '请输入原因', icon: 'none' });
      return;
    }

    handleReturn({
      orderId: order.id,
      action: returnAction as '退货' | '换货',
      reason: returnReason.trim(),
      refundAmount: returnAction === '退货' ? parseFloat(refundAmount) || 0 : undefined
    });

    setShowReturnModal(false);
    Taro.showToast({ title: `${returnAction}申请已提交`, icon: 'success' });
  };

  const handleReturnComplete = () => {
    Taro.showModal({
      title: '处理完成',
      content: `确认完成${order.returnInfo?.type || '退换'}处理？`,
      success: (res) => {
        if (res.confirm) {
          handleReturn({
            orderId: order.id,
            action: '完成',
            refundAmount: order.returnInfo?.type === '退货' ? (order.returnInfo.refundAmount || order.paidAmount) : undefined
          });
          Taro.showToast({ title: '处理完成', icon: 'success' });
        }
      }
    });
  };

  const handleCompleteDelivery = () => {
    const fee = parseFloat(deliveryFee) || 0;
    completeDelivery({
      orderId: order.id,
      signRemark: signRemark.trim() || undefined,
      deliveryFee: fee
    });
    setShowCompleteModal(false);
    Taro.showToast({ title: '配送已完成', icon: 'success' });
  };

  const sizeLabels: Record<string, string> = {
    gender: '性别',
    height: '身高',
    weight: '体重',
    shoulder: '肩宽',
    chest: '胸围',
    waist: '腰围',
    hip: '臀围',
    sleeve: '袖长',
    pants: '裤长',
    shoeSize: '鞋码'
  };

  const sizeUnits: Record<string, string> = {
    height: 'cm',
    weight: 'kg',
    shoulder: 'cm',
    chest: 'cm',
    waist: 'cm',
    hip: 'cm',
    sleeve: 'cm',
    pants: 'cm',
    shoeSize: '码'
  };

  const statusConfig = {
    '待确认': {
      text: '等待门店确认订单',
      hint: '请核对尺寸、材质、套装等信息，确认后将进入定制流程',
      nextTitle: '下一步：确认订单信息',
      nextDesc: '检查客户信息、商品明细、尺寸材质无误后，点击"确认订单"开始定制。如有问题可取消订单。',
      nextIcon: '✅'
    },
    '定制中': {
      text: '正在为您定制中',
      hint: '工厂正在按定制要求加紧制作，请耐心等待',
      nextTitle: '下一步：标记定制完成',
      nextDesc: '商品制作完成并质检通过后，标记为待配送，准备安排物流。',
      nextIcon: '🏭'
    },
    '待配送': {
      text: '定制完成，等待配送',
      hint: '商品已完成制作，可安排配送至客户指定地点',
      nextTitle: '下一步：安排配送',
      nextDesc: '确认配送地址和联系人信息后，点击"开始配送"，进入配送流程。',
      nextIcon: '🚚'
    },
    '配送中': {
      text: '订单正在配送途中',
      hint: '配送员正在前往指定地址，请保持电话畅通',
      nextTitle: '下一步：确认配送完成',
      nextDesc: '客户签收后，填写送达时间和签收备注，如有配送服务费一并录入。',
      nextIcon: '✅'
    },
    '已完成': {
      text: '订单已完成，感谢您的信任',
      hint: '',
      nextTitle: '',
      nextDesc: '',
      nextIcon: ''
    },
    '已取消': {
      text: '订单已取消',
      hint: '',
      nextTitle: '',
      nextDesc: '',
      nextIcon: ''
    },
    '退换中': {
      text: '退换处理中',
      hint: '正在处理客户的退换申请',
      nextTitle: '下一步：完成退换处理',
      nextDesc: '根据退换类型完成相应操作后，点击"处理完成"更新订单状态。',
      nextIcon: '🔄'
    }
  } as const;

  const currentStatus = order.status as keyof typeof statusConfig;
  const statusInfo = statusConfig[currentStatus];

  const actions = getStatusActions(order);

  const itemsTotal = useMemo(() =>
    order.items.reduce((s, i) => s + i.price * i.quantity, 0),
    [order.items]
  );

  const materialFee = order.materialPrice ?? 0;
  const customFee = order.customServiceFee ?? 500;
  const urgentFee = order.urgentFee ?? 0;
  const deliveryFeeActual = order.deliveryFee ?? 0;
  const finalTotal = order.totalAmount + deliveryFeeActual;

  const orderBillSummary = useMemo(() => {
    const totalIn = orderBills.filter(b => b.type === '收入').reduce((s, b) => s + b.amount, 0);
    const totalOut = orderBills.filter(b => b.type === '支出').reduce((s, b) => s + b.amount, 0);
    return { totalIn, totalOut };
  }, [orderBills]);

  return (
    <View className={styles.page}>
      <View className={styles.statusHeader}>
        <View className={styles.statusRow}>
          <Text className={styles.statusBadge}>{order.status}</Text>
          {order.isUrgent && <Text className={styles.urgentTag}>急单</Text>}
        </View>
        <Text className={styles.statusText}>{statusInfo.text}</Text>
        {statusInfo.hint && <Text className={styles.statusHintText}>💡 {statusInfo.hint}</Text>}
        <Text className={styles.orderNo}>订单号：{order.orderNo}</Text>
      </View>

      {statusInfo.nextTitle && (
        <View className={styles.nextActionCard}>
          <View className={styles.nextActionHeader}>
            <Text className={styles.nextActionIcon}>{statusInfo.nextIcon}</Text>
            <Text className={styles.nextActionTitle}>{statusInfo.nextTitle}</Text>
          </View>
          <Text className={styles.nextActionDesc}>{statusInfo.nextDesc}</Text>
          {actions.length > 0 && actions.length === 1 && order.status !== '退换中' && (
            <View className={styles.nextActionBtn} onClick={actions[0].action}>
              👉 立即{actions[0].label}
            </View>
          )}
        </View>
      )}

      <View className={styles.timeline}>
        {timeline.map((item, idx) => (
          <View key={idx} className={styles.timelineItem}>
            <View className={classnames(styles.timelineDot, item.active && styles.active)}>
              {item.active ? '✓' : ''}
            </View>
            <View className={styles.timelineContent}>
              <Text className={styles.timelineTitle}>{item.title}</Text>
              {item.time && <Text className={styles.timelineTime}>{item.time}</Text>}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.tabs}>
        <View
          className={classnames(styles.tabItem, activeTab === 'info' && styles.tabActive)}
          onClick={() => setActiveTab('info')}
        >
          订单信息
        </View>
        <View
          className={classnames(styles.tabItem, activeTab === 'bills' && styles.tabActive)}
          onClick={() => setActiveTab('bills')}
        >
          对账记录（{orderBills.length}）
        </View>
      </View>

      {activeTab === 'info' && (
        <>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>👕</Text>
              商品清单
            </Text>
            <View className={styles.goodsList}>
              {order.items.map((item, idx) => (
                <View key={idx} className={styles.goodsItem}>
                  <View className={styles.goodsImg}>👔</View>
                  <View className={styles.goodsInfo}>
                    <View>
                      <Text className={styles.goodsName}>{item.productName}</Text>
                      <Text className={styles.goodsMeta}>
                        {item.size && `尺寸：${item.size}`}
                        {item.material && ` · 材质：${item.material}`}
                      </Text>
                    </View>
                    <View className={styles.goodsPriceRow}>
                      <Text className={styles.goodsPrice}>{formatPrice(item.price)}</Text>
                      <Text className={styles.goodsQty}>x{item.quantity}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {order.sizeInfo && Object.keys(order.sizeInfo).length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📏</Text>
                尺寸信息
              </Text>
              {Object.entries(order.sizeInfo).map(([key, value]) => (
                <View key={key} className={styles.infoRow}>
                  <Text className={styles.infoLabel}>{sizeLabels[key] || key}</Text>
                  <Text className={styles.infoValue}>
                    {value}{sizeUnits[key] || ''}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {order.materialNames && order.materialNames.length > 0 && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🧵</Text>
                面料材质
              </Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>已选材质</Text>
                <Text className={styles.infoValue}>{order.materialNames.join('、')}</Text>
              </View>
            </View>
          )}

          {order.suitName && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🎁</Text>
                套装搭配
              </Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>套装名称</Text>
                <Text className={styles.infoValue}>{order.suitName}</Text>
              </View>
            </View>
          )}

          {order.taboos && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🙏</Text>
                避讳习俗
              </Text>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>避讳提示</Text>
                <Text className={styles.infoValue}>{order.taboos}</Text>
              </View>
            </View>
          )}

          {order.returnInfo && (
            <View className={styles.section}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>🔄</Text>
                退换信息
              </Text>
              <View className={styles.returnInfo}>
                <Text className={styles.returnType}>
                  {order.returnInfo.type === '退货' ? '📤 退货申请' : '🔄 换货申请'}
                </Text>
                <Text className={styles.returnReason}>原因：{order.returnInfo.reason}</Text>
                {order.returnInfo.handleTime && (
                  <Text className={styles.returnReason}>处理时间：{order.returnInfo.handleTime}</Text>
                )}
                {order.returnInfo.refundAmount !== undefined && (
                  <Text className={styles.returnReason}>退款金额：{formatPrice(order.returnInfo.refundAmount)}</Text>
                )}
              </View>
            </View>
          )}

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>📍</Text>
              配送信息
            </Text>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系人</Text>
              <Text className={styles.infoValue}>{order.customerName}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系电话</Text>
              <Text className={styles.infoValue}>{order.customerPhone}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>配送地址</Text>
              <Text className={styles.infoValue}>{order.address}</Text>
            </View>
            {order.funeralHome && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>殡仪馆</Text>
                <Text className={styles.infoValue}>{order.funeralHome}</Text>
              </View>
            )}
            {order.deliverCompleteTime && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>送达时间</Text>
                <Text className={styles.infoValue}>{order.deliverCompleteTime}</Text>
              </View>
            )}
            {order.signRemark && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>签收备注</Text>
                <Text className={styles.infoValue}>{order.signRemark}</Text>
              </View>
            )}
            {order.remark && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>订单备注</Text>
                <Text className={styles.infoValue}>{order.remark}</Text>
              </View>
            )}
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>💰</Text>
              费用明细
            </Text>
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>商品小计</Text>
              <Text className={styles.priceValue}>{formatPrice(itemsTotal)}</Text>
            </View>
            {order.materialNames && order.materialNames.length > 0 && (
              <View className={styles.priceRow}>
                <Text className={styles.priceLabel}>材质费用（{order.materialNames.length}种）</Text>
                <Text className={styles.priceValue}>{formatPrice(materialFee)}</Text>
              </View>
            )}
            <View className={styles.priceRow}>
              <Text className={styles.priceLabel}>定制服务费</Text>
              <Text className={styles.priceValue}>{formatPrice(customFee)}</Text>
            </View>
            {urgentFee > 0 && (
              <View className={styles.priceRow}>
                <Text className={styles.priceLabel}>
                  加急费用
                  <Text className={classnames(styles.feeTag, styles.feeTagUrgent)}>急单</Text>
                </Text>
                <Text className={styles.priceValue} style={{ color: '#A33D3D', fontWeight: 600 }}>
                  +{formatPrice(urgentFee)}
                </Text>
              </View>
            )}
            {deliveryFeeActual > 0 && (
              <View className={styles.priceRow}>
                <Text className={styles.priceLabel}>
                  配送费用
                  <Text className={classnames(styles.feeTag, styles.feeTagDelivery)}>配送</Text>
                </Text>
                <Text className={styles.priceValue} style={{ color: '#4A6B8A', fontWeight: 600 }}>
                  +{formatPrice(deliveryFeeActual)}
                </Text>
              </View>
            )}
            <View className={styles.priceTotal}>
              <Text className={styles.priceLabel}>
                订单总金额
                {order.isUrgent && <Text className={classnames(styles.feeTag, styles.feeTagUrgent)}>含加急费</Text>}
                {deliveryFeeActual > 0 && <Text className={classnames(styles.feeTag, styles.feeTagDelivery)}>含配送费</Text>}
              </Text>
              <Text className={styles.priceValue}>{formatPrice(finalTotal)}</Text>
            </View>
          </View>
        </>
      )}

      {activeTab === 'bills' && (
        <View className={styles.section}>
          <View className={styles.billSectionHeader}>
            <Text className={styles.sectionTitle} style={{ marginBottom: 0 }}>
              <Text className={styles.sectionIcon}>📝</Text>
              对账记录
            </Text>
            <View className={styles.billSummary}>
              <Text>收入 </Text>
              <Text className={styles.billSummaryIn}>+{formatPrice(orderBillSummary.totalIn)}</Text>
              {orderBillSummary.totalOut > 0 && (
                <>
                  <Text>　支出 </Text>
                  <Text className={styles.billSummaryOut}>-{formatPrice(orderBillSummary.totalOut)}</Text>
                </>
              )}
            </View>
          </View>
          {orderBills.length > 0 ? (
            orderBills.map(bill => (
              <View key={bill.id} className={styles.billItem}>
                <View className={styles.billInfo}>
                  <Text className={styles.billCategory}>{bill.category}</Text>
                  <Text className={styles.billRemark}>{bill.date}{bill.remark ? ' · ' + bill.remark : ''}</Text>
                </View>
                <Text className={classnames(styles.billAmount, bill.type === '收入' ? 'in' : 'out')}>
                  {bill.type === '收入' ? '+' : '-'}{formatPrice(bill.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View className={styles.empty}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无对账记录</Text>
            </View>
          )}
        </View>
      )}

      {order.status === '退换中' && order.returnInfo?.type && (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.btn, styles.btnPrimary)} onClick={handleReturnComplete}>
            处理完成
          </View>
        </View>
      )}

      {actions.length > 0 && order.status !== '退换中' && (
        <View className={styles.bottomBar}>
          {actions.map((action, idx) => (
            <View
              key={idx}
              className={classnames(styles.btn, action.className)}
              onClick={action.action}
            >
              {action.label}
            </View>
          ))}
        </View>
      )}

      {showReturnModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>{returnAction}处理</Text>
              <Text className={styles.modalClose} onClick={() => setShowReturnModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>{returnAction}原因</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder={`请输入${returnAction}原因`}
                  value={returnReason}
                  onInput={(e) => setReturnReason(e.detail.value)}
                />
              </View>
              {returnAction === '退货' && (
                <View className={styles.formRow}>
                  <Text className={styles.formLabel}>退款金额（元）</Text>
                  <Input
                    className={styles.formInput}
                    type='digit'
                    placeholder='请输入退款金额'
                    value={refundAmount}
                    onInput={(e) => setRefundAmount(e.detail.value)}
                  />
                </View>
              )}
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.cancelBtn} onClick={() => setShowReturnModal(false)}>
                取消
              </View>
              <View className={styles.confirmBtn} onClick={handleReturnSubmit}>
                确认提交
              </View>
            </View>
          </View>
        </View>
      )}

      {showCompleteModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalContent}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>配送完成</Text>
              <Text className={styles.modalClose} onClick={() => setShowCompleteModal(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>签收备注</Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder='请输入签收情况说明，如本人签收、代签等'
                  value={signRemark}
                  onInput={(e) => setSignRemark(e.detail.value)}
                />
              </View>
              <View className={styles.formRow}>
                <Text className={styles.formLabel}>配送服务费（元）</Text>
                <Input
                  className={styles.formInput}
                  type='digit'
                  placeholder='请输入配送服务费，没有则填0'
                  value={deliveryFee}
                  onInput={(e) => setDeliveryFee(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.cancelBtn} onClick={() => setShowCompleteModal(false)}>
                取消
              </View>
              <View className={styles.confirmBtn} onClick={handleCompleteDelivery}>
                确认完成
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default OrderDetailPage;
