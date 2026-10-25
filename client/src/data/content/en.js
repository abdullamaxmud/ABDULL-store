// English help-center FAQs and policy pages.
export const faqGroups = [
  {
    id: 'orders',
    icon: '📦',
    title: 'Orders & Tracking',
    items: [
      {
        q: 'How do I track my order?',
        a: 'Sign in and open My Orders. Each order shows a live progress timeline (Pending → Confirmed → Processing → Shipped → Delivered). You also receive status updates by email as your parcel moves.',
      },
      {
        q: 'Can I change or cancel my order?',
        a: 'You can cancel any order that has not shipped yet from its order details page — stock is released and any promo code is returned to your account automatically. Once an order is shipped, please start a return instead.',
      },
      {
        q: 'I received the wrong or a damaged item. What now?',
        a: 'Sorry about that! Contact us within 7 days of delivery with your order number and a photo of the item. We will send a replacement or a full refund, and you will not pay for return shipping.',
      },
    ],
  },
  {
    id: 'shipping',
    icon: '🚚',
    title: 'Shipping & Delivery',
    items: [
      {
        q: 'How much does shipping cost?',
        a: 'Standard shipping is free on orders of ${threshold} or more. Below that a flat ${fee} fee applies. Use the code FREESHIP at checkout for free shipping on any order while the promotion lasts.',
      },
      {
        q: 'How long will delivery take?',
        a: 'Orders are processed within 1–2 business days. Standard delivery then takes 3–7 business days depending on your location. You will see an estimated delivery date on every product page.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes — we deliver to over 100 countries. Duties and import taxes may be charged by your local customs office and are the responsibility of the recipient.',
      },
    ],
  },
  {
    id: 'returns',
    icon: '🔄',
    title: 'Returns & Refunds',
    items: [
      {
        q: 'What is your return policy?',
        a: 'Most items can be returned within 30 days of delivery as long as they are unused and in their original packaging. Beauty products must be unopened for hygiene reasons.',
      },
      {
        q: 'How do I start a return?',
        a: 'Contact our support team with your order number and the items you would like to return. We will email you a prepaid return label and drop-off instructions.',
      },
      {
        q: 'When will I get my refund?',
        a: 'Refunds are issued to your original payment method within 5–10 business days after we receive and inspect your return. Cash on Delivery orders are refunded by bank transfer or store credit.',
      },
    ],
  },
  {
    id: 'payments',
    icon: '💳',
    title: 'Payments & Promo Codes',
    items: [
      {
        q: 'Which payment methods do you accept?',
        a: 'You can pay by credit or debit card (Visa, Mastercard, American Express and more) through our secure Stripe payment page, or choose Cash on Delivery. Your card details are handled by Stripe and never stored on our servers.',
      },
      {
        q: 'How do I use a promo code?',
        a: 'Enter your code in the "Promo code" box on the checkout page and press Apply. The discount is shown instantly in your order summary. Only one code can be used per order.',
      },
      {
        q: 'Why is my promo code not working?',
        a: 'Codes may have a minimum order value, an expiry date, or be limited to your first order. The checkout page tells you exactly why a code could not be applied.',
      },
    ],
  },
  {
    id: 'account',
    icon: '👤',
    title: 'Account & Security',
    items: [
      {
        q: 'Do I need an account to shop?',
        a: 'You can browse, save items and fill your bag as a guest. You will be asked to sign in or create a free account at checkout — your bag and wishlist come with you.',
      },
      {
        q: 'How do I reset my password?',
        a: 'If you are signed in, change it from Account Profile → Change Password. If you are locked out, contact support from the email address on your account and we will help you recover it.',
      },
      {
        q: 'Is my personal information safe?',
        a: 'Yes. Passwords are hashed, connections are encrypted, and we never sell your data. Read our Privacy Policy for the details.',
      },
    ],
  },
];

export const policyPages = {
  about: {
    title: 'About ABDULL',
    eyebrow: 'Our Story',
    intro:
      'ABDULL is a global online marketplace for fashion, beauty and technology. We bring trending styles and flagship gadgets together in one place, at prices that make sense.',
    sections: [
      {
        heading: 'What we do',
        body: [
          'We partner directly with brands and verified suppliers so every product on ABDULL is authentic. Our buying team adds new arrivals every week, from everyday basics to the latest flagship phones.',
        ],
      },
      {
        heading: 'Our promise',
        list: [
          '100% authentic products from verified brands and suppliers',
          'Free standard shipping on orders of ${threshold} or more',
          '30-day hassle-free returns on most items',
          'Real people in customer support, 7 days a week',
        ],
      },
      {
        heading: 'Get in touch',
        body: ['Questions, feedback or partnership ideas? Visit our Contact page — we reply within 24 hours.'],
      },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    eyebrow: 'Customer Care',
    updated: 'October 2026',
    intro: 'Everything you need to know about how and when your order arrives.',
    sections: [
      {
        heading: 'Shipping rates',
        list: [
          'Free standard shipping on orders of ${threshold} or more (after discounts)',
          '${fee} flat-rate standard shipping on orders under ${threshold}',
          'Free shipping on any order with promo code FREESHIP while the offer lasts',
        ],
      },
      {
        heading: 'Processing & delivery times',
        body: [
          'Orders are processed within 1–2 business days. Orders placed on weekends or public holidays are processed the next business day.',
          'Standard delivery takes 3–7 business days after dispatch. Remote areas may take a few days longer.',
        ],
      },
      {
        heading: 'International orders',
        body: [
          'We ship to over 100 countries. Import duties, taxes and customs fees are not included in the order total and are payable by the recipient.',
        ],
      },
      {
        heading: 'Tracking',
        body: ['Track every order in real time from My Orders. Status changes are shown on the order timeline as soon as they happen.'],
      },
    ],
  },
  returns: {
    title: 'Returns & Refunds',
    eyebrow: 'Customer Care',
    updated: 'October 2026',
    intro: 'Not quite right? Return it within 30 days.',
    sections: [
      {
        heading: 'Eligibility',
        list: [
          'Items must be returned within 30 days of delivery',
          'Items must be unused, unwashed and in original packaging with tags attached',
          'Beauty and personal-care products must be unopened and sealed',
          'Final-sale and gift-card purchases cannot be returned',
        ],
      },
      {
        heading: 'How to return',
        list: [
          'Contact support with your order number and the items you want to return',
          'We email you a prepaid return label within one business day',
          'Pack the items securely and drop the parcel at the carrier location shown on the label',
        ],
      },
      {
        heading: 'Refunds',
        body: [
          'Once your return is received and inspected, we refund the item price to your original payment method within 5–10 business days. Cancelling a card-paid order before it ships refunds your card automatically. Original shipping fees are refundable only for damaged, defective or incorrect items.',
        ],
      },
      {
        heading: 'Exchanges',
        body: ['Need a different size or colour? Return the original item and place a new order — it is the fastest way to get what you want.'],
      },
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Legal',
    updated: 'October 2026',
    intro: 'This policy explains what personal information we collect, why, and the choices you have.',
    sections: [
      {
        heading: 'Information we collect',
        list: [
          'Account details: name, email address, phone number and delivery address',
          'Order details: items purchased, totals and delivery status',
          'Technical data: device and browser information used to keep the site secure',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To process, deliver and support your orders',
          'To keep your account secure and prevent fraud',
          'To send marketing emails — only if you subscribe, and you can unsubscribe at any time',
        ],
      },
      {
        heading: 'Sharing',
        body: [
          'We share data only with service providers who help us run the store (for example delivery partners), and only as much as they need. We never sell your personal information.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can view and update your details from Account Profile at any time. To request a copy or deletion of your data, contact our support team.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Legal',
    updated: 'October 2026',
    intro: 'By using ABDULL you agree to these terms. Please read them carefully.',
    sections: [
      {
        heading: 'Accounts',
        body: ['You are responsible for keeping your password confidential and for all activity on your account. Tell us straight away if you suspect unauthorised use.'],
      },
      {
        heading: 'Orders & pricing',
        body: [
          'All prices are shown in US dollars. We reserve the right to cancel orders affected by pricing errors or stock unavailability; you will be refunded in full if this happens.',
          'Promo codes cannot be exchanged for cash, are limited to one per order and may carry conditions shown at checkout.',
        ],
      },
      {
        heading: 'Product information',
        body: ['We work hard to describe and photograph products accurately, but colours may vary slightly between screens.'],
      },
      {
        heading: 'Limitation of liability',
        body: ['To the extent permitted by law, ABDULL is not liable for indirect or consequential losses arising from use of the site.'],
      },
    ],
  },
};
