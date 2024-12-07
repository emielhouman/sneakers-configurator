const cartItems = [];

// Haal de opgeslagen data uit localStorage
const sneakerData = JSON.parse(localStorage.getItem('sneakerData'));

const selectedSize = localStorage.getItem('selectedSize') || 'N/A';  // 'N/A' als er geen maat is geselecteerd

// Controleer of sneakerData bestaat en voeg de items toe aan cartItems
if (sneakerData && sneakerData.order && sneakerData.order.sneakerConfigs) {
  const sneakerConfigs = sneakerData.order.sneakerConfigs;

  // Voeg een schoen toe aan cartItems met de verschillende onderdelen in de details
  cartItems.push({
    product: "Balenciaga Track", // Altijd de naam van de schoen
    size: selectedSize,                
    quantity: 1,                // Altijd 1 hoeveelheid
    price: 120,                 // Altijd prijs van 120 EUR
    parts: sneakerConfigs      // Voeg de verschillende onderdelen toe in de parts
  });
}

function updateCart() {
  const cartTable = document.getElementById('cart-items');
  const subtotalElem = document.getElementById('subtotal');
  const totalElem = document.getElementById('total');

  cartTable.innerHTML = '';  // Maak de tabel leeg
  let subtotal = 0;

  // Voeg het product toe aan de tabel (er is maar 1 product: "Balenciaga Track")
  cartItems.forEach((item, index) => {
    subtotal += item.price * item.quantity; // De prijs van 1 schoen is altijd 120

    cartTable.innerHTML += `
      <tr>
        <td>${item.product}</td>
        <td>${item.size}</td>  <!-- Toon de maat -->
        <td>
          <!-- Hoeveelheid aanpassen met knoppen -->
          <div class="quantity-controls">
            <button onclick="changeQuantity(${index}, -1)">−</button>
            <span id="quantity-${index}">${item.quantity}</span>
            <button onclick="changeQuantity(${index}, 1)">+</button>
          </div>
        </td>
        <td>€${item.price}</td>  <!-- Toon de prijs in EUR -->
        <td><button onclick="removeItem(${index})">×</button></td>
        <td>
          <!-- Toevoegen van de 'Show Details' knop -->
          <button onclick="toggleDetails(${index})" id="toggle-details-btn-${index}" style="padding: 5px 10px; background-color: #007bff; color: white; border: none; cursor: pointer;">Show Details</button>
        </td>
      </tr>
 <tr id="details-row-${index}" style="display:none;">
  <td colspan="6">
    <div id="details-${index}" class="details-grid" style="display:none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
      ${Object.keys(item.parts).map(partKey => {
        const part = item.parts[partKey];
        return `
          <div style="padding: 10px;">
            <strong>${part.name}</strong>
            <p><strong>Color:</strong> ${part.colorName || 'No color selected'}</p>
            <p><strong>Texture:</strong> ${part.textureName || 'No texture selected'}</p>
          </div>
        `;
      }).join('')}
    </div>
  </td>
</tr>
    `;
  });

  // Update de subtotaal en totaal
  subtotalElem.textContent = `€${subtotal.toFixed(2)}`;
  totalElem.textContent = `€${subtotal.toFixed(2)}`;
}

// Functie om de hoeveelheid aan te passen met de knoppen
function changeQuantity(index, delta) {
  cartItems[index].quantity = Math.max(1, cartItems[index].quantity + delta);
  document.getElementById(`quantity-${index}`).textContent = cartItems[index].quantity;
  updateCart();
}

function removeItem(index) {
  cartItems.splice(index, 1);
  updateCart();
}

// Functie om de details van een onderdeel te tonen/te verbergen
function toggleDetails(index) {
  const detailsDiv = document.getElementById(`details-${index}`);
  const detailsRow = document.getElementById(`details-row-${index}`);
  const toggleButton = document.getElementById(`toggle-details-btn-${index}`);

  if (detailsDiv.style.display === 'none') {
    // Toon details
    detailsDiv.style.display = 'grid'; // We gebruiken grid om de 3 kolommen weer te geven
    detailsRow.style.display = 'table-row';
    toggleButton.textContent = 'Hide Details';
  } else {
    // Verberg details
    detailsDiv.style.display = 'none';
    detailsRow.style.display = 'none';
    toggleButton.textContent = 'Show Details';
  }
}

// Update de cart zodra de pagina is geladen
document.addEventListener('DOMContentLoaded', updateCart);