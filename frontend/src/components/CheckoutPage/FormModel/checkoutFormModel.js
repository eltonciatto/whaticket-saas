export default {
  formId: 'checkoutForm',
  formField: {
    firstName: {
      name: 'firstName',
      label: 'Nome completo*',
      requiredErrorMsg: 'O nome completo é obrigatório'
    },
    lastName: {
      name: 'lastName',
      label: 'Sobrenome*',
      requiredErrorMsg: 'O sobrenome é obrigatório'
    },
    address1: {
      name: 'address2',
      label: 'Endereço*',
      requiredErrorMsg: 'O endereço é obrigatório'
    },
    city: {
      name: 'city',
      label: 'Cidade*',
      requiredErrorMsg: 'A cidade é obrigatória'
    },
    state: {
      name: 'state',
      label: 'Estado*',
      requiredErrorMsg: 'O estado é obrigatório'
    },
    zipcode: {
      name: 'zipcode',
      label: 'CEP*',
      requiredErrorMsg: 'O CEP é obrigatório',
      invalidErrorMsg: 'Formato de CEP inválido'
    },
    country: {
      name: 'country',
      label: 'País*',
      requiredErrorMsg: 'O país é obrigatório'
    },
    useAddressForPaymentDetails: {
      name: 'useAddressForPaymentDetails',
      label: 'Usar este endereço para detalhes de pagamento'
    },
    invoiceId: {
      name: 'invoiceId',
      label: 'ID da Fatura'
    },
    nameOnCard: {
      name: 'nameOnCard',
      label: 'Nome no cartão*',
      requiredErrorMsg: 'O nome no cartão é obrigatório'
    },
    cardNumber: {
      name: 'cardNumber',
      label: 'Número do cartão*',
      requiredErrorMsg: 'O número do cartão é obrigatório',
      invalidErrorMsg: 'O número do cartão não é válido (ex: 4111111111111)'
    },
    expiryDate: {
      name: 'expiryDate',
      label: 'Data de validade*',
      requiredErrorMsg: 'A data de validade é obrigatória',
      invalidErrorMsg: 'A data de validade não é válida'
    },
    cvv: {
      name: 'cvv',
      label: 'CVV*',
      requiredErrorMsg: 'O CVV é obrigatório',
      invalidErrorMsg: 'O CVV é inválido (ex: 357)'
    }
  }
};
