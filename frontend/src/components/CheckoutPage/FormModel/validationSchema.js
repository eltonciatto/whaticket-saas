import * as Yup from 'yup';
import checkoutFormModel from './checkoutFormModel';

const {
  formField: {
    firstName,
    address1,
    city,
    zipcode,
    country,
  }
} = checkoutFormModel;

export default [
  Yup.object().shape({
    [firstName.name]: Yup.string()
      .required(firstName.requiredErrorMsg)
      .test('is-valid-name', 'Nome inválido', (value) => !!value && value.trim().length > 0),
    [address1.name]: Yup.string().required(address1.requiredErrorMsg),
    [city.name]: Yup.string()
      .nullable()
      .required(city.requiredErrorMsg),
    [zipcode.name]: Yup.string()
      .required(zipcode.requiredErrorMsg)
      .matches(/^[0-9]{5}-[0-9]{3}$/, 'CEP inválido'),
    [country.name]: Yup.string()
      .nullable()
      .required(country.requiredErrorMsg)
      .test('is-valid-country', 'País inválido', (value) => value && ['BR', 'usa'].includes(value)), // Restrição a países válidos
  }),
];
