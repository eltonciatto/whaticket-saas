import React, { useContext, useEffect, useState } from "react";
import { Grid, Typography } from "@material-ui/core";
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

  const {
    formField: { firstName, address1, city, state, zipcode, country },
    setFieldValue
  } = props;

  useEffect(() => {
    if (!company.billingName) {
      toast.warn("Algumas informações do endereço não estão preenchidas. Por favor, revise.");
    }
    setFieldValue(firstName.name, billingName);
    setFieldValue(zipcode.name, addressZipCode);
    setFieldValue(address1.name, addressStreet);
    setFieldValue(state.name, addressState);
    setFieldValue(city.name, addressCity);
    setFieldValue(country.name, addressDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingName, addressZipCode, addressStreet, addressState, addressCity, addressDistrict]);

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
            helperText={!billingName && "Nome não encontrado. Por favor, preencha."}
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
          />
        </Grid>
        <Grid item xs={4}>
          <InputField
            name={zipcode.name}
            label={zipcode.label}
            fullWidth
            value={addressZipCode}
            onChange={(e) => {
              setAddressZipCode(e.target.value);
              setFieldValue(zipcode.name, e.target.value);
            }}
            helperText={addressZipCode && !/^[0-9]{5}-[0-9]{3}$/.test(addressZipCode) ? "CEP inválido" : ""}
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
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
