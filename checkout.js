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

    // Haal de opgeslagen data uit localStorage
    const sneakerData = JSON.parse(localStorage.getItem('sneakerData'));

    // Controleer of de data bestaat
    if (sneakerData) {
      const sneakerConfigs = sneakerData.order.sneakerConfigs;
      const sneakerDetailsDiv = document.getElementById('sneaker-details');

      // Loop door de configuraties en voeg ze toe aan de pagina
      for (const part in sneakerConfigs) {
        if (sneakerConfigs.hasOwnProperty(part)) {
          const config = sneakerConfigs[part];
          const partName = config.name;
          const colorName = config.colorName || 'No color selected';  // Gebruik colorName in plaats van color
          const textureName = config.textureName || 'No texture selected';

          // Maak een element om de details weer te geven
          const partDiv = document.createElement('div');
          partDiv.innerHTML = `
            <strong>${partName}</strong><br>
            Color: ${colorName}<br>  <!-- Toon de kleurnaam -->
            Texture: ${textureName}<br><br>
          `;

          // Voeg het toe aan de sneaker summary
          sneakerDetailsDiv.appendChild(partDiv);
        }
      }
    } else {
      // Als er geen data is opgeslagen, geef een bericht weer
      document.getElementById('sneaker-details').innerHTML = 'No sneaker data found in localStorage.';
    }