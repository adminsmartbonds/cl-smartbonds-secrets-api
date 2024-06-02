# smartbonds-api
SmartBonds Secrets API layer 

This API is a straightforward API without Swagger Contract definition, that is used to
update the DON secrets on Chainlink for the purposes of keeping the functions capabilities alive.

The fact that @chainlink/functions-toolkit includes ganache which has a series of security
audit failures and also causes dependencies to be brought in that google functions cannot process,
lead us to include the SecretsManager JS code directly into this codebase rather than importing
the library.


