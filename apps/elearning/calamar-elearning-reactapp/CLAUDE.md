# Calamar e-learning React App

Let's create an e-learning app in react and ASP.NET Core. Let's use the file system for storage, storing all data in 2 configurable root folders (their default locations will be 2 folders inside the folder where the app is deployed):
 - the local data folder
 - the remote data folder

There will be 3 types of users (for each login being required using email address as username):
 - admin (will manage the hierarchy of course categories and course tags)
 - content creator (will publish courses, with the ability to remove and edit their own)
 - end user (will subscribe to courses by either browsing the category tree or through search)

There will be 1 admin user and its email will be tincuvd@gmail.com (and the password will be asked for on first admin login). Content creators and end users can create their own accounts (while admins can't). Let's still start with 1 content creator account (dan.tincu.work@gmail.com) and 1 end user account (dan.tincu.misc@gmail.com). All 3 users will be asked for their passwords on first long. Let's store all passwords encrypted in a sqlite database file (inside the this app's local data folder specified in config). All users will be allowed to change their passwords by choosing the "forgot password" option, at which point a randomly generated code will be sent to their email address and a corresponding textbox will be shown in the page then for the user to enter their code.

As opposed to course categories, course tags will act like gmail labels, that is any course can have any number of tags attached to it.

## How the courses will be stored to files and folders

Inside our sqlite database, besides information about users, we will also store the course categories created by the admin and the course tags created by the content creators. Then, for the courses created by content creators, let's borrow the "folder pairs" and the "notes" strategies from another project I created, the strategies having been described in the following files: `C:\A\T\ayran\JsWs\apps\csdrive-webhost\csdrive-webhost-v2\docs\strategies\folder-pairs-strategy.md` and `C:\A\T\ayran\JsWs\apps\csdrive-webhost\csdrive-webhost-v2\docs\strategies\notes-strategy.md`. So in our remote data folder we will have a folder called "c" where a note item will be created for each creator (having the email address for the full name part). Then inside the note item for each account we will have a child note item for each course created by that creator. Such "course root notes" will contain the table of contents for the course. Then its child notes will represent the course pages (you can arrange them hyerarchically based on course chapters and subchapters). Each course page will be able to have files attached to it, and these files will live inside the note's [note-files] folders pair. For software engineering courses these files will most probably be sample code files. Course chapters will be represented by ternary note sections while course pages will be represented by note items.

## Actual courses to be added from the start

Let's add 2 courses right after we create this app (and associate them to dan.tincu.work@gmail.com creator account):
 - One for learning React
 - One for learning Rust

## Deployment

Let's deploy the app here: `c:\Users\danti\AppData\Local\Calamar\Apps\Bin\calamar-elearning-reactapp\`. I already created folders "client" and "server".