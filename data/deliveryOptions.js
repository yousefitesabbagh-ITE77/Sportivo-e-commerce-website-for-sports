export const deliveryOptions = [
  {
    id: '1',
    deliveryDays: 7,
    priceCents: 0
  },
  {
    id: '2',
    deliveryDays: 3,
    priceCents: 499
  },
  {
    id: '3',
    deliveryDays: 1,
    priceCents: 999
  }
];

function getSafeDate(dateInput = new Date()) {
  const date = dateInput instanceof Date ? new Date(dateInput) : new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return new Date();
  }

  return date;
}

function isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

export function getDeliveryOption(deliveryOptionId) {
  return deliveryOptions.find((option) => option.id === deliveryOptionId) || deliveryOptions[0];
}

export function addBusinessDays(startDateInput = new Date(), businessDays = 0) {
  const deliveryDate = getSafeDate(startDateInput);
  deliveryDate.setHours(12, 0, 0, 0);

  let remainingDays = Number(businessDays) || 0;

  while (remainingDays > 0) {
    deliveryDate.setDate(deliveryDate.getDate() + 1);

    if (!isWeekend(deliveryDate)) {
      remainingDays--;
    }
  }

  return deliveryDate;
}

export function calculateDeliveryDateISO(deliveryOption, startDateInput = new Date()) {
  const safeDeliveryOption = deliveryOption || deliveryOptions[0];
  const deliveryDate = addBusinessDays(startDateInput, safeDeliveryOption.deliveryDays);

  return deliveryDate.toISOString();
}

export function formatDeliveryDate(dateInput, options = {}) {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  const formatterOptions = {
    month: 'long',
    day: 'numeric'
  };

  if (options.includeWeekday !== false) {
    formatterOptions.weekday = 'long';
  }

  if (options.includeYear) {
    formatterOptions.year = 'numeric';
  }

  return new Intl.DateTimeFormat('en-US', formatterOptions).format(date);
}

export function calculateDeliveryDate(deliveryOption, startDateInput = new Date()) {
  const deliveryDateISO = calculateDeliveryDateISO(deliveryOption, startDateInput);
  return formatDeliveryDate(deliveryDateISO);
}

export function isDelivered(deliveryDateInput, referenceDateInput = new Date()) {
  const deliveryDate = new Date(deliveryDateInput);
  const referenceDate = getSafeDate(referenceDateInput);

  if (Number.isNaN(deliveryDate.getTime())) {
    return false;
  }

  return referenceDate.getTime() >= deliveryDate.getTime();
}