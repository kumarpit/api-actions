class InvalidRSAA extends Error {
  constructor() {
    super();
    (this.name = 'InvalidRSAA'), (this.message = 'Invalid RSAA');
  }
}

export { InvalidRSAA };
