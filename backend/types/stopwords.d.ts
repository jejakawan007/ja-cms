declare module 'stopwords' {
  const stopwords: {
    [language: string]: string[];
  };
  
  export default stopwords;
  export = stopwords;
}
