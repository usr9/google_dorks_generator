# Google Dorks Generator Extension

A Firefox extension that helps generate advanced Google search queries (Google dorks) using Claude AI. The extension helps you create sophisticated search patterns to find specific information on the internet more effectively.

## Features

- 🤖 AI-powered Google dorks generation using Claude
- 🔍 Creates multiple search variations for comprehensive results
- 📝 Search history management
- 🔐 Secure API key storage
- 🔄 Direct Google search links

# Compatibility
⚠️ This extension has only been tested on Firefox for macOS. Compatibility with other browsers or operating systems is not guaranteed.

## Installation

Currently, the extension needs to be installed manually:

1. Clone this repository:
```bash
git clone https://github.com/usr9/google_dorks_generator.git
```

2. Load the extension in Firefox:

- Navigate to `about:debugging`
- Click "This Firefox"
- Click "Load Temporary Add-on"
- Select any file in the extension's directory


## Configuration

Before using the extension, you need to configure your Claude API key:

- Click the extension icon in your browser
- Go to the "Settings" tab
- Enter your Claude API key
- Click "Save API Key"

## Usage

1. **Generating Dorks**:
   - Click the extension icon
   - Enter a description of what you're looking for
   - Click "Generate Dorks"
   - Click any generated query to open it in Google

2. **Managing History**:
   - Access your search history in the "History" tab
   - Click queries to reuse them
   - Delete individual items or clear all history
   - History is stored locally in your browser

3. **Settings**:
   - Configure your Claude API key
   - API key is stored securely in your browser's local storage

## Example Queries

Here are some example descriptions you can use:

- "Find public Google Docs about machine learning"
- "Look for publicly accessible security camera feeds"
- "Find requiters from Company X on LinkedIn"

## Privacy & Security

- Your Claude API key is stored securely in your browser's local storage
- Search history is stored locally and never transmitted
- The extension only communicates with Google (for searches) and Anthropic's API (for generating queries)
- No tracking or analytics are implemented

## Contributing

Contributions are welcome! Please feel free to fork and submit a Pull Request.


## Important Note

Please use this tool responsibly. While Google dorks are legitimate search techniques, they can potentially reveal sensitive information.

## Limitations

- The extension requires a Claude API key to function
- API usage is subject to Anthropic's pricing and rate limits
- Some advanced dorks might be blocked by Google's search restrictions
- Browser support is currently limited to Firefox

## Technical Details

- Built using vanilla JavaScript
- Uses the browser's storage API for data persistence
- Implements the Claude API for query generation
- Uses browser extension Manifest V2

## Support

If you encounter any issues or have suggestions:

1. Check existing GitHub issues
2. Create a new issue with:
   - Your browser version
   - Extension version
   - Clear description of the problem
   - Steps to reproduce

## Acknowledgments

- Anthropic for the Claude API