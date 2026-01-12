import { CountryConfig, CountryFormatting } from "../types";
import params from "../../parameters/countries/estonia.json";

export const ESTONIA_CONFIG: CountryConfig = {
  code: params.code as "EE",
  name: params.name,
  flag: params.flag,
  locale: params.locale,

  options: params.options,

  age: params.age,

  products: params.products,

  formatting: params.formatting as CountryFormatting,

  legal: params.legal,

  availableProducts: params.availableProducts as CountryConfig["availableProducts"],
};
