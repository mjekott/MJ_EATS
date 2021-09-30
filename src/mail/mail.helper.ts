// eslint-disable-next-line @typescript-eslint/ban-types
export const mapData = (emailData: Object, emailVar: any[]) => {
  emailVar.forEach((variable) => {
    emailData[variable.key] = variable.value;
  });
};

export const sendCallback = (error: any, body: any) => {};
