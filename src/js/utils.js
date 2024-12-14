// sleep for any number of milliseconds
export const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
};

// HTML-escape XML special chars: " & ' < > `
export const xmlEntities = (str) => {
  return String(str).replace(/["&'<>`]/g,
           function (x) { return '&#x'+x.codePointAt(0).toString(16)+';'; });
};
