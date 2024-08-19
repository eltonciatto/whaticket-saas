import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography, Button } from "@material-ui/core";
import { InputField, SelectField } from "../../FormFields";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const countries = [
  { value: "BR", label: "Brasil" },
  { value: "USA", label: "United States" },
  { value: "PT", label: "Portugal" },
];

export default function AddressForm(props) {
  const { user } = useContext(AuthContext);
  const company = user?.company || {};

  const [billingName, setBillingName] = useState(company.billingName || "");
  const [addressZipCode, setAddressZipCode] = useState(company.addressZipCode || "");
  const [addressStreet, setAddressStreet] = useState(company.addressStreet || "");
  const [addressState, setAddressState] = useState(company.addressState || "");
  const [addressCity, setAddressCity] = useState(company.addressCity || "");
  const [addressDistrict, setAddressDistrict] = useState(company.addressDistrict || "");
  const [hasTriedToProceed, setHasTriedToProceed] = useState(false);

  const {
    formField: { firstName, address1, city, state, zipcode, country },
    setFieldValue
  } = props;

  useEffect(() => {
    // Setando os valores iniciais no Formik
    setFieldValue(firstName.name, billingName);
    setFieldValue(zipcode.name, formatZipCode(addressZipCode));
    setFieldValue(address1.name, addressStreet);
    setFieldValue(state.name, addressState);
    setFieldValue(city.name, addressCity);
    setFieldValue(country.name, addressDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingName, addressZipCode, addressStreet, addressState, addressCity, addressDistrict]);

  const formatZipCode = (zipCode) => {
    // Aceitar CEP sem hífen e formatá-lo automaticamente
    if (zipCode && zipCode.length === 8 && /^[0-9]{8}$/.test(zipCode)) {
      return zipCode.replace(/(\d{5})(\d{3})/, "$1-$2");
    }
    return zipCode;
  };

  const handleNextStep = () => {
    setHasTriedToProceed(true);
    if (!billingName || !addressZipCode || !addressStreet || !addressState || !addressCity || !addressDistrict) {
      toast.error("Por favor, preencha todas as informações obrigatórias antes de prosseguir.");
      return false;
    }
    return true;
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Vamos precisar de algumas informações
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={6} sm={6}>
          <InputField
            name={firstName.name}
            label={firstName.label}
            fullWidth
            value={billingName}
            onChange={(e) => {
              setBillingName(e.target.value);
              setFieldValue(firstName.name, e.target.value);
            }}
            error={hasTriedToProceed && !billingName}
            helperText={hasTriedToProceed && !billingName && "Nome não preenchido"}
          />
        </Grid>
        <Grid item xs={6} sm={6}>
          <SelectField
            name={country.name}
            label={country.label}
            data={countries}
            fullWidth
            value={addressDistrict}
            onChange={(e) => {
              setAddressDistrict(e.target.value);
              setFieldValue(country.name, e.target.value);
            }}
            error={hasTriedToProceed && !addressDistrict}
            helperText={hasTriedToProceed && !addressDistrict && "País não preenchido"}
          />
        </Grid>
        <Grid item xs={4}>
          <InputField
            name={zipcode.name}
            label={zipcode.label}
            fullWidth
            value={formatZipCode(addressZipCode)}
            onChange={(e) => {
              const formattedZipCode = formatZipCode(e.target.value);
              setAddressZipCode(formattedZipCode);
              setFieldValue(zipcode.name, formattedZipCode);
            }}
            error={hasTriedToProceed && !addressZipCode}
            helperText={hasTriedToProceed && !addressZipCode && "CEP não preenchido"}
          />
        </Grid>
        <Grid item xs={8}>
          <InputField
            name={address1.name}
            label={address1.label}
            fullWidth
            value={addressStreet}
            onChange={(e) => {
              setAddressStreet(e.target.value);
              setFieldValue(address1.name, e.target.value);
            }}
            error={hasTriedToProceed && !addressStreet}
            helperText={hasTriedToProceed && !addressStreet && "Endereço não preenchido"}
          />
        </Grid>
        <Grid item xs={4}>
          <InputField
            name={state.name}
            label={state.label}
            fullWidth
            value={addressState}
            onChange={(e) => {
              setAddressState(e.target.value);
              setFieldValue(state.name, e.target.value);
            }}
            error={hasTriedToProceed && !addressState}
            helperText={hasTriedToProceed && !addressState && "Estado não preenchido"}
          />
        </Grid>
        <Grid item xs={8}>
          <InputField
            name={city.name}
            label={city.label}
            fullWidth
            value={addressCity}
            onChange={(e) => {
              setAddressCity(e.target.value);
              setFieldValue(city.name, e.target.value);
            }}
            error={hasTriedToProceed && !addressCity}
            helperText={hasTriedToProceed && !addressCity && "Cidade não preenchida"}
          />
        </Grid>
      </Grid>
      {/* Botão para testar a próxima etapa */}
      <Button onClick={handleNextStep} variant="contained" color="primary">
        Próximo
      </Button>
    </React.Fragment>
  );
}
