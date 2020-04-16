# dotenv-encrypt aka dotencr

Encrypt and decrypt individual lines inside a .env file. Supports multiple environments. Encryption keys can be read from a text file or from the environment.

Uses [dotenv](https://www.npmjs.com/package/dotenv) for reading .env files.

## Features

### Transparently decrypt values in your dotenv file

Inside your .env

```shell
CIPHERED__DEV__EMAIL_API=q6M1bArrP6vCQooz.ZUi7rAgMG+KrOOVJ1qKyYB7W/umPFKZTGZ5UIh5JBBGlRTluS2yr.CcggXA5pndStr4MjczcwDg==
```

is loaded into the **process.env** as

```shell
UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
```

### Use a single .env file for all of you environments

```shell
CIPHERED__PROD__MONGODB_CONN_URI=kBIT9XGsjJde1k8P.3jutbijodVqQ3s6r8HGIvAJ6VVqxTr3TRVZr/WpUsLsL131stt2iBKPvWymrVmfPuvBBc0zsUEMeJn8X2LICKg==.8b95MRxaLVHWZP90Jl+18Q==
CIPHERED__TEST__MONGODB_CONN_URI=tm/NnqfiLJrEck+e.hQnpgKjoST/EuGd6T+wEg+LUOSiQh/F18JlQNgVAdT/h/zO+yOsb2W/C9R6p/iV7xgL5ZXQOxWDhfmRUTCVXnw==.3CkkMVRSbUOsHiHW0xgIWg==
CIPHERED__DEV__MONGODB_CONN_URI=eKUJcDfhjsLSuGiO.5zEuGMbJIr2kJCkxi2h7M/fd9PBIEE18HOrp/6nEZY7stNKm7UvrwBtNJkybpzqh7TuHhzVdi6y3kugd1JO2.e8pu7Q4bX5G7S/fPIOW86Q==
CIPHERED__LOCAL__MONGODB_CONN_URI=XrWJtbMpeSd/pGkS.nRVgbW9/gtbYGdezQ5WyN3hydn4sHGhXcQJcFja/Dvfn2z9fiEmpq/6x.FjREVjOxemKZKO0iDk+goQ==
```

### Supports multiple encryption keys, one for each environment

```shell
DOTENV_ENC_KEY__LOCAL=VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ=
DOTENV_ENC_KEY__DEV=DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=
DOTENV_ENC_KEY__TEST=nLseXPYWho9TF1x+lOnC7EkwijvMd0RQMa5IWLhzN2A=
DOTENV_ENC_KEY__PROD=1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo=
```

### Only decrypt the needed environment

The library only decrypts a variable if the encryption key is provided. For example, in your development environment, don't include the TEST or PROD keys and those will remain encrypted.

Adding this to your environment

```shell
export DOTENV_ENC_KEY__DEV=DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=
```

Only decrypts DEV

```DIFF
CIPHERED__TEST__SESSION_SECRET=AAAAAAAAAAAAAAAA.6xal+yDKO/4bnAzadSwPXiS14w==.zHzDrwblNDF59kyhGYHS7Q==
- CIPHERED__DEV__SESSION_SECRET=AAAAAAAAAAAAAAAA.MndptYojylf1fOfwdz56sWiC.R+b7yj0gUGNM2ZhvynKM/A==
+ UNENCRYPTED__DEV__SESSION_SECRET=dev session secret
CIPHERED__PROD__SESSION_SECRET=AAAAAAAAAAAAAAAA.8fxYOsLT/KGUwNrNXepufxIN4w==.EP1+C5B5V+IuM3j3c/7VdQ==
```

### Usage tip #1: Using a common key for all environments

If you have information common to all environments, you can create a specific encryption key just for that information.

```shell
DOTENV_ENC_KEY__ALL=VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ=
UNENCRYPTED__ALL__VARIABLE_COMMON_TO_ALL_ENVIRONMENTS=common info for all environments
```

### Usage tip #2: wildcard

Writing _WILDCARD_ as the key name, `dotenv-encrypt` will try all the encryption keys.

For example, CIPHERED\_\_WILDCARD\_\_MONGODB_CONN_URI, will try all the encryption keys:

-   DOTENV_ENC_KEY\_\_LOCAL
-   DOTENV_ENC_KEY\_\_DEV
-   DOTENV_ENC_KEY\_\_TEST
-   DOTENV_ENC_KEY\_\_PROD

##### Example

Use the CIPHERED\_\_**WILDCARD**\_\_MONGODB_CONN_URI entry to connect to your various MongoDb servers regardless of the environment you are running in.

Copy the encrypted value `tm/NnqfiLJrEck+e.hQnpgKjoST/EuGd6T+wEg+LUOSiQh/F18JlQNgVAdT/h/zO+yOsb2W/C9R6p/iV7xgL5ZXQOxWDhfmRUTCVXnw==.3CkkMVRSbUOsHiHW0xgIWg==` from _CIPHERED\_\_TEST\_\_MONGODB_CONN_URI_ to _CIPHERED\_\_WILDCARD\_\_MONGODB_CONN_URI_

```diff
CIPHERED__TEST__MONGODB_CONN_URI=tm/NnqfiLJrEck+e.hQnpgKjoST/EuGd6T+wEg+LUOSiQh/F18JlQNgVAdT/h/zO+yOsb2W/C9R6p/iV7xgL5ZXQOxWDhfmRUTCVXnw==.3CkkMVRSbUOsHiHW0xgIWg==
+ CIPHERED__WILDCARD__MONGODB_CONN_URI=tm/NnqfiLJrEck+e.hQnpgKjoST/EuGd6T+wEg+LUOSiQh/F18JlQNgVAdT/h/zO+yOsb2W/C9R6p/iV7xgL5ZXQOxWDhfmRUTCVXnw==.3CkkMVRSbUOsHiHW0xgIWg==
```

This will be appear in your `process.env` as `UNENCRYPTED__WILDCARD__MONGODB_CONN_URI`

```js
console.log(process.env["UNENCRYPTED__WILDCARD__MONGODB_CONN_URI"]);
> mongodb://<mlab_user>:<mlab_password>@<mlab_connection_url_test>
```

### Easily generate new keys

Use **openssl** to generate new encryption keys

```shell
$ openssl rand -base64 32
FThmNEaGrawthp3ZdiEFfCceds4Hn2ZY6pu6NImyNy8=
```

Add the new encryption key to your .bash_profile, dotenv file, or cloud environment.

```shell
export DOTENV_ENC_KEY__NEW_KEY=FThmNEaGrawthp3ZdiEFfCceds4Hn2ZY6pu6NImyNy8=
```

### Uses AES-256-GCM encryption

The library uses AES 256 bit encryption in GCM mode. GCM mode generates a value that can be used to verify the data has not been modified. See wikipedia for more information [Galois_Counter_Mode](https://en.wikipedia.org/wiki/Galois/Counter_Mode).

The encrypted text is divided into three parts, separated by a period: IV (Initialization Vector), Ciphered Text, Authentication Tag

```shell
CIPHERED__PROD__SECRET_TEXT=wdb1kM/1Wfs4DtFI.dUx0+UTvozWgheWrJPwEQ+sE23YpvDwp6U9P3BIwq8jpf3Nz2uEyUurG74KOqcjTDRuKlg7UKHBgyJSZnBZC.gr+I4brHK7EcCSWdB01EIg==

Initialization Vector (base64 encoding): wdb1kM/1Wfs4DtFI
Ciphered text (base64 encoding): dUx0+UTvozWgheWrJPwEQ+sE23YpvDwp6U9P3BIwq8jpf3Nz2uEyUurG74KOqcjTDRuKlg7UKHBgyJSZnBZC
Authentication Tag (base64 encoding): gr+I4brHK7EcCSWdB01EIg==
```

-   Initialization Vector: is a randomly generated starting value. See wikipedia for more information [Initialization_vector](https://en.wikipedia.org/wiki/Initialization_vector).

-   Ciphered Text: is the encrypted value.

-   Authentication Tag: is used to verify the data has not been modified. It's purpose is similar to that of an HMAC.

## Naming conventions

### Encryption keys

| Full text                                                               | Prefix         | Separator | Encryption key name | Equal sign | Encryption key (base 64 encoding)            |
| ----------------------------------------------------------------------- | -------------- | :-------: | ------------------- | :--------: | -------------------------------------------- |
| DOTENV_ENC_KEY\_\_KEY_NAME=VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ= | DOTENV_ENC_KEY |   \_\_    | KEY_NAME            |     =      | VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ= |
| DOTENV_ENC_KEY\_\_DEV=DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=      | DOTENV_ENC_KEY |   \_\_    | DEV                 |     =      | DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY= |
| DOTENV_ENC_KEY\_\_PROD=1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo=     | DOTENV_ENC_KEY |   \_\_    | PROD                |     =      | 1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo= |

### Unencrypted dotenv variables

| Full text                                                     | Prefix      | Separator | Encryption key name | Separator | Variable Name  | Equal sign | Value               | Uses this encryption key (see table above)   |
| ------------------------------------------------------------- | ----------- | :-------: | ------------------- | :-------: | -------------- | :--------: | ------------------- | -------------------------------------------- |
| UNENCRYPTED\_\_KEY_NAME\_\_SESSION_SECRET=test session secret | UNENCRYPTED |   \_\_    | KEY_NAME            |   \_\_    | SESSION_SECRET |     =      | misc session secret | VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ= |
| UNENCRYPTED\_\_DEV\_\_SESSION_SECRET=dev session secret       | UNENCRYPTED |   \_\_    | DEV                 |   \_\_    | SESSION_SECRET |     =      | dev session secret  | DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY= |
| UNENCRYPTED\_\_PROD\_\_SESSION_SECRET=prod session secret     | UNENCRYPTED |   \_\_    | PROD                |   \_\_    | SESSION_SECRET |     =      | prod session secret | 1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo= |

### Ciphered dotenv variables

| Full text                                                                                                     | Prefix   | Separator | Encryption key name                         | Separator | Variable Name  | Equal sign | Value                                                                  | Uses this encryption key (see table above)                                  |
| ------------------------------------------------------------------------------------------------------------- | -------- | :-------: | ------------------------------------------- | :-------: | -------------- | :--------: | ---------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| CIPHERED\_\_KEY_NAME\_\_SESSION_SECRET=P/qFaEaLinQlpN0J.YA+s/bm/i7ATXTNC6xk1T0QD9Q==.X6LMY5Ihl4jVuelLVan50A== | CIPHERED |   \_\_    | KEY_NAME                                    |   \_\_    | SESSION_SECRET |     =      | P/qFaEaLinQlpN0J.YA+s/bm/i7ATXTNC6xk1T0QD9Q==.X6LMY5Ihl4jVuelLVan50A== | VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ=                                |
| CIPHERED\_\_DEV\_\_SESSION_SECRET=08W5CnmckwGwGMiK.HbQljYHWzkVdjpntPP6Obk+g.MMyAlD+wJR57xN+MwNRXnQ==          | CIPHERED |   \_\_    | DEV                                         |   \_\_    | SESSION_SECRET |     =      | 08W5CnmckwGwGMiK.HbQljYHWzkVdjpntPP6Obk+g.MMyAlD+wJR57xN+MwNRXnQ==     | DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=                                |
| CIPHERED\_\_PROD\_\_SESSION_SECRET=u6nMOBh8dsph+ccL.s/LPl2ZEYUqlOm7jruDBv3z3qA==.QbXFaAwm/SzOQk/HEqRbXg==     | CIPHERED |   \_\_    | PROD                                        |   \_\_    | SESSION_SECRET |     =      | u6nMOBh8dsph+ccL.s/LPl2ZEYUqlOm7jruDBv3z3qA==.QbXFaAwm/SzOQk/HEqRbXg== | 1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo=                                |
| CIPHERED\_\_WILDCARD\_\_SESSION_SECRET=u6nMOBh8dsph+ccL.s/LPl2ZEYUqlOm7jruDBv3z3qA==.QbXFaAwm/SzOQk/HEqRbXg== | CIPHERED |   \_\_    | try all the encryption keys when decrypting |   \_\_    | SESSION_SECRET |     =      | u6nMOBh8dsph+ccL.s/LPl2ZEYUqlOm7jruDBv3z3qA==.QbXFaAwm/SzOQk/HEqRbXg== | decryption successful with key 1J5L9wJrfOnLo/0M62q+az43wDjiLfvXw9UZlV0mMCo= |

### Why UNENCRYPTED and CIPHERED

I picked completely different words for the sake of readability. `UNENCRYPTED` and `ENCRYPTED` are too easily confused.

### Storing encryption keys

Encryption keys can be read from the environment or from a file.

This is an example of how to add encryption keys to your `.bash_profile`

```shell
export DOTENV_ENC_KEY__LOCAL=VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ=
export DOTENV_ENC_KEY__DEV=DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=
export DOTENV_ENC_KEY__VERY_LONG_NAME=nLseXPYWho9TF1x+lOnC7EkwijvMd0RQMa5IWLhzN2A=
```

The encryption keys can also be stored in a dotenv file, `.env_encryption_keys`, and loaded into your environment using the **dotenv** library

```shell
DOTENV_ENC_KEY__LOCAL=VRd/lYPCt6uV0NgiRSlFmzMKAaGdhWkItWHvkOUIIfQ=
DOTENV_ENC_KEY__DEV=DA2Yj8nc383NOBLsWBT7LH22ooU5YxdZTyiSYa6d2rY=
DOTENV_ENC_KEY__VERY_LONG_NAME=nLseXPYWho9TF1x+lOnC7EkwijvMd0RQMa5IWLhzN2A=
```

:exclamation::exclamation: Please evaluate the ease of use vs security when deciding where to store your encryption keys. :exclamation::exclamation:

### 100% test coverage

## Installation

Using npm:

```shell
$ npm i dotencr
```

Note: add --save if you are using npm < 5.0.0

## NodeJS usage examples

**TypeScript**

```typescript
import { decryptProcessEnvironment } from "dotencr";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const processEnvDecryptionResult = decryptProcessEnvironment();

console.log(process.env["UNENCRYPTED__LOCAL__SESSION_SECRET"]);
```

**JavaScript**

```js
const decryptProcessEnvironment = require("dotencr").decryptProcessEnvironment;
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const processEnvDecryptionResult = decryptProcessEnvironment();

console.log(process.env["UNENCRYPTED__LOCAL__SESSION_SECRET"]);
```

## Command line usage examples

Invoke the application using `dotenc` on the command line.

### Decrypt a key value pair

```shell
$ dotenc kdec CIPHERED__DEV__EMAIL_API=q6M1bArrP6vCQooz.ZUi7rAgMG+KrOOVJ1qKyYB7W/umPFKZTGZ5UIh5JBBGlRTluS2yr.CcggXA5pndStr4MjczcwDg==
UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
```

### Encrypt a key value pair

```shell
$ dotenc kenc UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
CIPHERED__DEV__EMAIL_API=NLCiZiNCJTsvLDFc.+G+3LS3vuHwxP1X/4ZTbcui05gTVOJcZXqZa0Qz8kwlmocBGwnjT.cBKY+6Jz/eb+A326+a0oVQ==
```

### Decrypt a triple: decryption_key_name variable_name value

```shell
$ dotenc xdec DEV EMAIL_API FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==
UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
```

### Encrypt a triple: decryption_key_name variable_name value

```shell
$ $ dotenc xenc DEV EMAIL_API EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c
CIPHERED__DEV__EMAIL_API=LxhVW3OmYt+dpH/m.1RPR6EHpbeeIYwt/Hukn2fm/BGGp+k+4bRB2/87TZ5fzd8/4VOLE.+c3VL3eBERKmpqsrkTU4pg==
```

### Test a file to see which variables can and cannot be decrypted

The results of the test are written to the file `dotenv-encrypt_log.json`

```shell
$ dotenc test --file .env
$ cat dotenv-encrypt_log.json
```

### Encrypt an environment file

The results of the encryption are written to the file `dotenv-encrypt_log.json`

```shell
$ dotenc enc --file .env
$ cat dotenv-encrypt_log.json
```

### Decrypt an environment file

The results of the decryption are written to the file `dotenv-encrypt_log.json`

```shell
$ dotenc dec --file .env
$ cat dotenv-encrypt_log.json
```

### Specifying output folders

The location of the files can be written to distinct folders.

```shell
$ dotenc enc --file .env --output ./folder/.env.txt --jsonOutput ./another_folder/output.json --backupFolder ./folder_backups/env.bak
$ cat dotenv-encrypt_log.json
```

### Process multiple environment files

```shell
$ dotenc enc --file .env .env_prod .env_test
```

### The application will search for `.env`

```shell
$ dotenc enc
```

### Prevent the application from creating a backup file

By default, a backup file is created before encrypting or decrypting the environment file.

```shell
$ dotenc enc --no-backup
```

### Write relative paths to the JSON output file

By default, the full path is written to the JSON file. For example `\full\path\.env`

If `useRelativePaths` is specified, then the realtive folder path is written to the JSON file. For example `path\.env`

```shell
$ dotenc enc --useRelativePaths
```

## Command line usage

```
$ dotenc
Usage: dotenc <enc|kenc|xenc|dec|kdec|xdec|test> [options]

Commands:
  dotenc enc                        Encrypt the variables inside the dotenv file
  dotenc dec                        Decrypt the variables inside the dotenv file
  dotenc kenc <keyvalue>            Encrypt the command line value
  dotenc kdec <keyvalue>            Decrypt the command line value
  dotenc xenc <key> <name> <value>  Encrypt the command line value
  dotenc xdec <key> <name> <value>  Decrypt the command line value
  dotenc test                       Test decrypted dotenv file

Options:
  --version                      Show version number  [boolean]
  --file, -f                     dotenv file  [array] [default: [".env"]]
  --output, -o                   Output folder  [string]
  --jsonOutput, --jo             Write the results to the file in JSON format  [default: "dotenv-encrypt_log.json"]
  --backupFolder, --bf           Create a backup file in the specified folder.  [default: "."]
  --backup, -b                   create a backup file  [boolean] [default: true]
  --useRelativePaths, --relpath  Use relative folder paths  [boolean] [default: false]
  -h, --help                     Show help  [boolean]

Examples:
  dotenc enc -f .env.*                                                                                                                 Encrypt the contents of the variables inside the dotenv file
  dotenc dec -f .env.*                                                                                                                 Decrypt the contents of the variables inside the dotenv file
  dotenc test -f .env.*                                                                                                                Test the contents of the variables inside the dotenv file
  dotenc kdec CIPHERED__DEV__EMAIL_API=q6M1bArrP6vCQooz.ZUi7rAgMG+KrOOVJ1qKyYB7W/umPFKZTGZ5UIh5JBBGlRTluS2yr.CcggXA5pndStr4MjczcwDg==  Decrypt the command line
  dotenc kenc UNENCRYPTED__DEV__EMAIL_API=EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c                                                      Encrypt the command line
  dotenc xdec DEV EMAIL_API FhdQgQOC6th8fmti.IBxk8vKOTR4nYHPhDEJVB8ql7EW4rkd/tTxbXREjuMPrsoE0cbxu.JOv1f+AODXEUOUoACmgAQg==             Decrypt the command line
  dotenc xenc DEV EMAIL_API EM.74f2f09e-7fde-4de8-afd8-82bd5050cc5c                                                                    Encrypt the command line

copyright Carlos Klapp 2020
```

## Sample JSON output

```json
{
    "dotenvOutputFileName": "test/results/out/.env.mixed.enc",
    "dotenvSourceFileName": "test/env_test_files/.env.mixed",
    "errors": {
        "cipheredVariableErrors": [
            "The encryption key name is invalid [CIPHERED__WILDCARD__TOO__MANY__TOKENS] or the value is invalid [MCs42CZWs9pbCoN/.m6Yp3bKFWWt4zyBCAzchiYC+.Rpm7TcSbMcAJsNJGZqe/hg==].",
            "[CIPHERED__WILDCARD__TOO__MANY__TOKENS] Got 5 tokens on the left side. Expected between 3 and 3"
        ],
        "encryptionKeyErrors": [
            "The encryption key name [DOTENV_ENC_KEY__WILDCARD] is the reserved word [WILDCARD].",
            "The encryption key name is invalid [DOTENV_ENC_KEY__TOO___MANY] or the value is invalid [4fziNa9iDylQmkz6vJce7oSly1p3uge36ORwJUBt].",
            "Encryption key [DOTENV_ENC_KEY__TOO_SMALL] is too short. Expected a length of 32 bytes (256bits) and received 30 bytes."
        ],
        "errorDecryptingVariables": [
            "Exception: Variable: [CIPHERED__ALL__CIPHER_BAD_CIPHERED_TEXT], Message: [Unsupported state or unable to authenticate data]",
            "Exception: Variable: [CIPHERED__ALL__CIPHER_BAD_IV], Message: [Unsupported state or unable to authenticate data]",
            "Exception: Variable: [CIPHERED__ALL__CIPHER_BAD_TAG], Message: [Unsupported state or unable to authenticate data]",
            "Exception: Variable: [CIPHERED__LOCAL__BAD_CIPHER], Message: [Invalid authentication tag length: 3]",
            "Exception: Variable: [CIPHERED__WILDCARD__BAD_CIPHER], Message: [Invalid authentication tag length: 3]",
            "None of the encryption keys could decrypt [CIPHERED__WILDCARD__BAD_CIPHER]"
        ],
        "errorEncryptingVariables": ["Encryption key not found [DOTENV_ENC_KEY__MISSING_KEY]"],
        "errorValuesDoNotMatch": [
            "Mismatch between [UNENCRYPTED__ALL__MISMATCH_CIPHER_UNENCRYPTED] and [CIPHERED__ALL__MISMATCH_CIPHER_UNENCRYPTED]. [plain text value]!=[ciphered value]"
        ],
        "invalidVariableFormat": [
            "CIPHERED__WILDCARD__TOO__MANY__TOKENS",
            "UNENCRYPTED__WILDCARD__SESSION_SECRET"
        ],
        "plainTextVariableErrors": [
            "The encryption key name [UNENCRYPTED__WILDCARD__SESSION_SECRET] is the reserved word [WILDCARD]."
        ],
        "plainTextVariables": []
    },
    "info": {
        "encryptedVariables": [
            "CIPHERED__ALL__CIPHER_BAD_CIPHERED_TEXT",
            "CIPHERED__ALL__CIPHER_BAD_IV",
            "CIPHERED__ALL__CIPHER_BAD_TAG",
            "CIPHERED__ALL__MISMATCH_CIPHER_UNENCRYPTED",
            "CIPHERED__ALL__MONGODB_CONN_URI",
            "CIPHERED__DEV__MONGODB_CONN_URI",
            "CIPHERED__LOCAL__BAD_CIPHER",
            "CIPHERED__LOCAL__MONGODB_CONN_URI",
            "CIPHERED__LOCAL__SESSION_SECRET",
            "CIPHERED__PROD__MONGODB_CONN_URI",
            "CIPHERED__TEST__MONGODB_CONN_URI",
            "CIPHERED__WILDCARD__BAD_CIPHER",
            "CIPHERED__WILDCARD__MONGODB_CONN_URI",
            "CIPHERED__WILDCARD__SESSION_SECRET"
        ],
        "encryptionKeys": [
            "DOTENV_ENC_KEY__ALL",
            "DOTENV_ENC_KEY__DEV",
            "DOTENV_ENC_KEY__LOCAL",
            "DOTENV_ENC_KEY__PROD",
            "DOTENV_ENC_KEY__TEST"
        ],
        "matchingPlainTextAndCipherValues": [
            "Match between [UNENCRYPTED__LOCAL__SESSION_SECRET] and [CIPHERED__LOCAL__SESSION_SECRET]"
        ],
        "miscellaneous": [],
        "successfullyDecrypted": [
            "CIPHERED__ALL__MISMATCH_CIPHER_UNENCRYPTED",
            "CIPHERED__ALL__MONGODB_CONN_URI",
            "CIPHERED__DEV__MONGODB_CONN_URI",
            "CIPHERED__LOCAL__MONGODB_CONN_URI",
            "CIPHERED__LOCAL__SESSION_SECRET",
            "CIPHERED__PROD__MONGODB_CONN_URI",
            "CIPHERED__TEST__MONGODB_CONN_URI",
            "CIPHERED__WILDCARD__MONGODB_CONN_URI",
            "CIPHERED__WILDCARD__SESSION_SECRET"
        ],
        "successfullyEncrypted": [
            "UNENCRYPTED__ALL__MISMATCH_CIPHER_UNENCRYPTED",
            "UNENCRYPTED__ALL__SESSION_SECRET",
            "UNENCRYPTED__DEV__SESSION_SECRET",
            "UNENCRYPTED__LOCAL__SESSION_SECRET",
            "UNENCRYPTED__PROD__SESSION_SECRET",
            "UNENCRYPTED__TEST__SESSION_SECRET"
        ]
    },
    "warnings": {
        "missingEncryptionKeys": ["DOTENV_ENC_KEY__MISSING_KEY"]
    }
}
```

## Why the name

The original package name dotenv-encrypt. But there were name conflicts with NPM. So I chose dotencr. dotenc was available, but it was too close to the name dotenv.

I kept the command line name as dotenc since there isn't a name conflict at the moment.
