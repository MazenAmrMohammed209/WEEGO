const fs = require('fs');
let content = fs.readFileSync('src/app/admin/finance/page.tsx', 'utf8');

// Replace validation block
content = content.replace(
  /if \(\!isBookingValid \|\| \!formData\.booking_code\) \{[\s\S]*?toast\.error\("Invalid booking\. Cannot submit\."\);\n      return;\n    \}/g,
  `if (!formData.reference_number) {
      toast.error("Reference number is required");
      return;
    }

    if (!isBookingValid) {
      toast.error("Booking not found");
      return;
    }`
);

// Form payload
content = content.replace(
  /const payload = \{[\s\S]*?booking_code: formData\.booking_code,/,
  `console.log("FORM:", formData);\n      console.log("BOOKING DATA:", isBookingValid);\n\n      const pointsToAdd = calculatePoints(formData.amount);\n      const payload = {\n        booking_code: formData.reference_number,`
);

// editingBookingCode replacements
content = content.replace(/editingBookingCode/g, 'editingReferenceNumber');
content = content.replace(/setEditingBookingCode/g, 'setEditingReferenceNumber');
content = content.replace(/formData\.booking_code/g, 'formData.reference_number');

// Other variables
content = content.replace(/const code = formData\.booking_code;/g, 'const code = formData.reference_number;');
content = content.replace(/bookingCode/g, 'referenceNumber');
content = content.replace(/inv\.booking_code/g, 'inv.reference_number');
content = content.replace(/invoice\.booking_code/g, 'invoice.reference_number');

// UI Labels
content = content.replace(/INVOICE CODE \(BOOKING CODE\)/g, 'REFERENCE NUMBER');
content = content.replace(/Booking Code/gi, 'Reference Number');

fs.writeFileSync('src/app/admin/finance/page.tsx', content);
