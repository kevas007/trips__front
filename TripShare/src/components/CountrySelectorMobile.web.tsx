import React from 'react';

type Country = {
  cca2: string;
  callingCode: string[];
  name: { common: string };
};

type Props = {
  country: Country;
  setCountry: (c: Country) => void;
  setCountryCode: (code: string) => void;
  countryList: Country[];
};

const CountrySelectorWeb: React.FC<Props> = ({ country, setCountry, setCountryCode, countryList }) => {
  return (
    <select
      value={country.cca2}
      onChange={e => {
        const selected = countryList.find(c => c.cca2 === e.target.value);
        if (selected) {
          setCountry(selected);
          setCountryCode('+' + selected.callingCode[0]);
        }
      }}
      style={{ fontSize: 16, padding: 8, borderRadius: 8, border: '1px solid #ccc', marginRight: 8 }}
    >
      {countryList.map(c => (
        <option key={c.cca2} value={c.cca2}>
          {c.name.common} (+{c.callingCode[0]})
        </option>
      ))}
    </select>
  );
};

export default CountrySelectorWeb; 