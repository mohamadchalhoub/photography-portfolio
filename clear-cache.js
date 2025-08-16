// Script to clear localStorage and test content loading
console.log('Clearing localStorage...');

// Open browser console and run this
if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('siteContentEn');
  localStorage.removeItem('siteContentAr');
  console.log('✅ Cleared site content from localStorage');
  
  // Check what's left
  console.log('Remaining localStorage keys:', Object.keys(localStorage));
  
  // Reload the page to test fresh load from database
  window.location.reload();
} else {
  console.log('localStorage not available (run this in browser console)');
}
