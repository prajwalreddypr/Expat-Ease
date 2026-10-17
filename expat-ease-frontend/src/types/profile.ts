export interface ProfileFormData {
  full_name: string;
  street_address: string;
  city: string;
  postal_code: string;
  phone_number: string;
}

export interface ProfileMessage {
  type: 'success' | 'error';
  text: string;
}
