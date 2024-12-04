const cartItems = [
    { product: "Sneaker", size: "42", quantity: 2, price: 110.99 },
    { product: "Sneaker", size: "42", quantity: 1, price: 159.99 },
    { product: "Sneaker", size: "42", quantity: 1, price: 89.99 },
  ];
  
  function updateCart() {
    const cartTable = document.getElementById('cart-items');
    const subtotalElem = document.getElementById('subtotal');
    const totalElem = document.getElementById('total');
    
    cartTable.innerHTML = '';
    let subtotal = 0;
  
    cartItems.forEach((item, index) => {
      subtotal += item.quantity * item.price;
      cartTable.innerHTML += `
        <tr>
          <td>${item.product}</td>
          <td>${item.size}</td>
          <td>
            <button onclick="changeQuantity(${index}, -1)">−</button>
            ${item.quantity}
            <button onclick="changeQuantity(${index}, 1)">+</button>
          </td>
          <td>$${(item.quantity * item.price).toFixed(2)}</td>
          <td><button onclick="removeItem(${index})">×</button></td>
        </tr>
      `;
    });
  
    subtotalElem.textContent = subtotal.toFixed(2);
    totalElem.textContent = subtotal.toFixed(2);
  }
  
  function changeQuantity(index, delta) {
    cartItems[index].quantity = Math.max(1, cartItems[index].quantity + delta);
    updateCart();
  }
  
  function removeItem(index) {
    cartItems.splice(index, 1);
    updateCart();
  }
  
  document.addEventListener('DOMContentLoaded', updateCart);