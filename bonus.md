## 1. Emoji Picker Integration

- **Description**: An emoji picker has been integrated into the channel message input box, allowing users to easily add emojis to their messages.
- **Benefit**: This feature enhances the expressiveness of messages and offers a more fun and interactive way to communicate within the channels.

## 2. Loading Spinner Page

- **Description**: Implemented a loading spinner page that appears whenever data is being fetched or loaded.
- **Benefit**: It enhances the user experience by providing visual feedback that the page is loading, thus preventing any confusion or abrupt page changes.

## 3. Enter Key Message Send

- **Description**: Users can now send messages by pressing the "Enter" key when the cursor is in the message input box.
- **Benefit**: This offers a more intuitive and faster way to send messages, closely aligning with the expectations of many chat users.

## 4. Encapsulation of Fetch

- **Description**: The fetch API has been abstracted and encapsulated to handle HTTP requests seamlessly.
- **Benefit**: This approach:
  - Reduces code repetition by having a centralized method for making HTTP requests.
  - Enhances error handling by integrating toast notifications for server errors.
  - Improves code readability and maintainability.

## 5. Dynamic Default User Images

- **Description**: For users who have not uploaded their avatars, dynamically generated default images with varying colors are displayed to distinguish between them.
- **Benefit**: It ensures that each user is uniquely identifiable in a channel, enhancing user recognition and interaction.

## 6. Message Type Editing

- **Description**: While the assignment specified that text and image messages should be distinct, the application allows users to edit the type of their messages, switching between text and image.
- **Benefit**: This provides flexibility in message editing and allows users to correct or change the medium of their message after it's been sent, enhancing user experience.

## 7. Use of ES6 Modules

- **Description**: All scripts in the HTML files are imported using `type="module"`, like `<script type="module" src="src/toast.js"></script>`.
- **Benefit**: This approach:
  - Encourages modular programming, leading to cleaner and more maintainable code.
  - Allows for the use of modern ES6+ features like imports and exports.
  - Ensures that scripts are loaded asynchronously, which can improve page load performance.

## 8. Image Thumbnail Preview

- **Description**: Before sending an image to the channel, users can preview the chosen image as a thumbnail in the top right corner of the input box.
- **Benefit**: This gives users a confirmation of the image they're about to send, preventing accidental image sends and enhancing user confidence in their actions.

## 9. Logout from Multiple Pages

- **Feature**: Provided a logout functionality accessible both from the channel and profile pages.
- **Benefit**: Offers users the flexibility to sign out from different parts of the application without the need to navigate to a specific page. This enhances user convenience and provides a seamless experience.
- **Reason for Additional Marks**: Demonstrates thoughtful user experience design by providing essential features at the users' fingertips, regardless of their current location within the app.

## 10. Auto-Redirect for Unauthorized Access

- **Feature**: When a user who is not logged in (i.e., no token in local storage) tries to access the channel/profile screen, they are automatically redirected to the login page.
- **Benefit**: Ensures the privacy and security of the channel content. Also, it prevents potential errors or malfunctions that may occur if unauthorized users attempt to interact with the channel's features.
- **Reason for Additional Marks**: Prioritizes user security and data protection by preventing unauthorized access and guiding users to the appropriate authentication process.
