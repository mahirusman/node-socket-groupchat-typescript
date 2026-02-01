import UserService from "../services/Userservice";
import jwt from "jsonwebtoken";

export function filterParameters(
  requestBody: RequestBody,
  allowedParameters: AllowedParameters
): RequestBody {
  const result: RequestBody = {};
  //  if req.body is null or undefined
  requestBody = requestBody ?? {};
  allowedParameters.forEach((allowedParameters) => {
    if (typeof requestBody[allowedParameters] !== "undefined") {
      result[allowedParameters] = requestBody[allowedParameters];
    }
  });
  return result;
}

export function requiredParametersProvided(
  requestBody: RequestBody,
  allowedParameters: AllowedParameters,
  optionalParameters: AllowedParameters = []
): boolean {
  return (
    Object.keys(requestBody).filter(
      (parameter) => !optionalParameters.includes(parameter)
    ).length ===
    allowedParameters.filter(
      (parameter) => !optionalParameters.includes(parameter)
    ).length
  );
}
