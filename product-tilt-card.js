/* -------------------------
   3D TILT CARD FUNCTIONALITY
   ------------------------- */

// Open 3D Tilt Card with product details
function openTiltCard(product) {
  const backdrop = document.getElementById('tiltCardBackdrop');
  const card = document.getElementById('tiltCard');
  const image = document.getElementById('tiltCardImage');
  const name = document.getElementById('tiltCardName');
  const actualPriceEl = document.getElementById('tiltCardActualPrice');
  const discountedPriceEl = document.getElementById('tiltCardDiscountedPrice');
  const discountPercentEl = document.getElementById('tiltCardDiscountPercent');
  const glow = document.getElementById('tiltCardGlow');

  // Set product details
  image.src = product.image || '';
  image.alt = product.name || 'Product';
  name.textContent = product.name || 'Product Name';
  const actualPrice = Number(product.actualPrice ?? product.price ?? 0);
  const discountedPrice = Number(product.discountedPrice ?? product.price ?? 0);
  actualPriceEl.textContent = '₹' + actualPrice;
  discountedPriceEl.textContent = '₹' + discountedPrice;

  if (actualPrice > discountedPrice && actualPrice > 0) {
    const discountPercent = Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
    discountPercentEl.textContent = discountPercent + '% off';
    actualPriceEl.style.display = '';
  } else {
    discountPercentEl.textContent = '0% off';
    actualPriceEl.style.display = 'none';
  }

  // Reset flip state
  card.classList.remove('flipped');

  // Show the modal
  backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Add mouse move listener for tilt effect (only on front side)
  /*const frontSide = card.querySelector('.tilt-card-front');
  if (frontSide) {
    frontSide.addEventListener('mousemove', handleTiltMove);
    frontSide.addEventListener('mouseleave', handleTiltLeave);
  }*/

  //add Add mouse move listener for tilt effect full countainer
  const container = document.getElementById('tiltCardContainer');

  container.addEventListener('mousemove', handleTiltMove);
  container.addEventListener('mouseleave', handleTiltLeave);
}

// Flip the tilt card
function flipTiltCard() {
  const card = document.getElementById('tiltCard');
  card.classList.toggle('flipped');
}

// Close 3D Tilt Card
function closeTiltCard() {
  const backdrop = document.getElementById('tiltCardBackdrop');
  const card = document.getElementById('tiltCard');
  const frontSide = card.querySelector('.tilt-card-front');
  /*const container = document.getElementById('tiltCardContainer');*/

  backdrop.classList.remove('active');
  document.body.style.overflow = '';

  // Reset flip state
  card.classList.remove('flipped');

  // Reset tilt transform on front side
  if (frontSide) {
    frontSide.style.transform = '';
  }

  // Reset transform on CARD (not front side)
  /*card.style.transform = '';*/

  // Remove mouse move listeners
  if (frontSide) {
    frontSide.removeEventListener('mousemove', handleTiltMove);
    frontSide.removeEventListener('mouseleave', handleTiltLeave);
  }
  /*container.removeEventListener('mousemove', handleTiltMove);
  container.removeEventListener('mouseleave', handleTiltLeave);*/
}

// Handle mouse move for tilt effect (only on front)
function handleTiltMove(e) {
  const card = document.getElementById('tiltCard');
  const frontSide = card.querySelector('.tilt-card-front');
  const glow = document.getElementById('tiltCardGlow');

  // Don't tilt if card is flipped
  if (card.classList.contains('flipped')) return;

  const rect = frontSide.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const rotateX = ((y - centerY) / centerY) * -15;
  const rotateY = ((x - centerX) / centerX) * 15;

  frontSide.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

  // Position glow effect
  glow.style.left = `${x - 150}px`;
  glow.style.top = `${y - 150}px`;
  glow.style.opacity = '0.5';
}

// Handle mouse leave to reset tilt
function handleTiltLeave() {
  const card = document.getElementById('tiltCard');
  const frontSide = card.querySelector('.tilt-card-front');
  const glow = document.getElementById('tiltCardGlow');

  if (frontSide) {
    frontSide.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  }
  glow.style.opacity = '0';
}

// Close modal when clicking on backdrop
document.addEventListener('DOMContentLoaded', function() {
  const backdrop = document.getElementById('tiltCardBackdrop');
  if (backdrop) {
    backdrop.addEventListener('click', function(e) {
      if (e.target === backdrop) {
        closeTiltCard();
      }
    });
  }
});
