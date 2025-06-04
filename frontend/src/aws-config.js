const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'eu-north-1_VnRDiLZTh',
      userPoolClientId: '5rhf29iiq466lbsj26kkq8logg',
      signUpVerificationMethod: 'code',
      loginWith: {
        email: true,
        phone: false,
        username: false
      }
    }
  }
};

export default awsConfig; 