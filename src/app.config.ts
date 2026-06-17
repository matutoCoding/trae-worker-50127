export default defineAppConfig({
  pages: [
    'pages/styles/index',
    'pages/custom/index',
    'pages/orders/index',
    'pages/shop/index',
    'pages/style-detail/index',
    'pages/express/index',
    'pages/inventory-detail/index',
    'pages/bill-detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '福寿缘定制',
    navigationBarTextStyle: 'black',
    backgroundColor: '#F7F5F0'
  },
  tabBar: {
    color: '#8A7A6A',
    selectedColor: '#4A3728',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/styles/index',
        text: '款式'
      },
      {
        pagePath: 'pages/custom/index',
        text: '定制'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/shop/index',
        text: '门店'
      }
    ]
  }
})
