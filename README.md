# spreadsheets
module for pushing test results from cucumber results.json to google spreadsheets

## Installation

```
npm i
```

This module can be installed via npm on another project:

```
npm i "https://github.com/VolhaValasevich/spreadsheets.git"
```

## Usage

The reporter can be launched via the command line with the path to your report.json as an argument.

```
spreadsheets -r report.json
```

Alternatively, you can require it in your code.

```
const generateReport = require('spreadsheets');
generateReport('./report.json);
```

If the module is not authorized on Google yet (no access token found), you'll be prompted to follow the authorization link and copy the confirmation code into the terminal to create an access token.

```
info: Authorize this app by visiting this url: https://accounts.google.com/o/oauth2/v2/auth?...
Enter the code from that page here:
```

The module creates a Google Spreadsheet and stores its ID in a json file. If the file does not exist or the spreadsheet with such ID cannot be found, a new spreadsheet will be created.

## Parameters

- -r (--report) : path to your Cucumber report.json file.
