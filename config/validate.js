const Joi = require("joi");

const validateForAll = (params) => {
  const Schema = Joi.object({
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    password: Joi.string()
      .regex(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/
      )
      .required(),
    role: Joi.required(),
  });
  return Schema.validate(params);
};

const validateForCandidate = (params) => {
  const Schema = Joi.object({
    fullName: Joi.string().max(100).required(),
    age: Joi.number().min(18).max(100).required(),
    gender: Joi.string().required(),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    phoneNumber: Joi.string()
      .regex(/^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/)
      .required(),
    address: Joi.string().max(200).required(),
    description: Joi.string().max(1000),
  });
  return Schema.validate(params);
};

const validateForRecruiter = (params) => {
  const Schema = Joi.object({
    name: Joi.string().max(100).required(),
    website: Joi.string().max(100),
    email: Joi.string()
      .email({
        minDomainSegments: 2,
        tlds: { allow: ["com", "net"] },
      })
      .required(),
    phoneNumber:
      Joi.string().regex(
        /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/
      ) || regex(/(((\+|)84)|0)(3|5|7|8|9)+([0-9]{8})\b/).required(),
    address: Joi.string().max(200).required(),
    description: Joi.string().max(1000),
  });
  return Schema.validate(params);
};

const validateChangePassword = (params) => {
  const Schema = Joi.object({
    currentPassword: Joi.string()
      .regex(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/
      )
      .required(),
    newPassword: Joi.string()
      .regex(
        /^(?=(.*[a-z]){1,})(?=(.*[A-Z]){1,})(?=(.*[0-9]){1,})(?=(.*[!@#$%^&*()\-__+.]){1,}).{8,}$/
      )
      .required(),
    repeatNewPassword: Joi.ref("newPassword"),
  });
  return Schema.validate(params);
};

const validateRecruiment = (params) => {
  const Schema = Joi.object({
    title: Joi.string().max(100).required(),
    name: Joi.any().required(),
    description: Joi.string().required(),
    position: Joi.string().max(300).required(),
    type: Joi.string().required(),
    level: Joi.string().required(),
    age: Joi.string().required(),
    experience: Joi.string().required(),
    salary: Joi.string().max(100).required(),
    numberApplicant: Joi.number().required(),
    location: Joi.any().required(),
    status: Joi.string(),
    category: Joi.any().required(),
    createAt: Joi.any().required(),
    deadline: Joi.any().required(),
  });
  return Schema.validate(params);
};

module.exports = {
  validateForAll,
  validateForRecruiter,
  validateForCandidate,
  validateChangePassword,
  validateRecruiment,
};
