export function filterParameters(
  requestBody: RequestBody,
  allowedParameters: AllowedParameters
): RequestBody {
  const result: RequestBody = {};
  const normalizedRequestBody = requestBody ?? {};

  allowedParameters.forEach((parameter) => {
    if (typeof normalizedRequestBody[parameter] !== 'undefined') {
      result[parameter] = normalizedRequestBody[parameter];
    }
  });

  return result;
}

export function requiredParametersProvided(
  requestBody: RequestBody,
  allowedParameters: AllowedParameters,
  optionalParameters: AllowedParameters = []
): boolean {
  const providedRequiredParams = Object.keys(requestBody).filter(
    (parameter) => !optionalParameters.includes(parameter)
  ).length;

  const expectedRequiredParams = allowedParameters.filter(
    (parameter) => !optionalParameters.includes(parameter)
  ).length;

  return providedRequiredParams === expectedRequiredParams;
}
