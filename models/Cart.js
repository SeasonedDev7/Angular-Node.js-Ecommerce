module.exports = function Cart(oldCart) {
  this.items = oldCart.items || [];
  this.totalQty = oldCart.totalQty || 0;
  this.totalPrice = oldCart.totalPrice || 0;

  this.add = function (item, id) {
    if (item['$init']) {
      delete item['$init'];
    }
    const itemExist = this.items.filter(cartItem => cartItem.id == id).length ? true : false;

    if(!itemExist) {
        this.items.push({item, id, price : item.salePrice, qty: 1});
        this.totalQty++;
        this.totalPrice += item.salePrice;
    } else {
        this.items.forEach(cartItem => {
        if(cartItem.id == id) {
            cartItem.qty++;
            cartItem.price = item.salePrice + cartItem.price;
            this.totalQty++;
            this.totalPrice += item.salePrice;
        }
      })
    }
  };

  this.remove = function(item, id) {
    if (item['$init']) {
      delete item['$init'];
    }
    this.items = this.items.map(cartItem => {

        if(cartItem.id == id && cartItem.qty > 1) {
            cartItem.qty--;
            cartItem.price = cartItem.price - item.salePrice;
            this.totalQty--;
            this.totalPrice -= item.salePrice;
        } else if(cartItem.id == id && cartItem.qty == 1) {
            cartItem = {};
            this.totalQty--;
            this.totalPrice -= item.salePrice;
        }
        return cartItem;
    }).filter(cartItem => cartItem.id);


  };


}
