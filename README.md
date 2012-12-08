ScheduleCMU
=============

Group members
--------------
Nivedita Chopra (niveditc)
Madeline Horowitz (mhorowit)
Isaac Lim (idl)
Naman Bharadwaj (nbharadw)


Contents
--------------
1) Overall readme - README.md
2) Grading help - GRADING_HELP.md
3) Our design process - DESIGN_PROCESS.md
4) Our video - PROJECT-VIDEO.txt
5) ScheduleCMU Desktop Client - schedulecmu/public/desktop
6) ScheduleCMU Mobile Client - schedulecmu/public/mobile
7) All scripts - schedulecmu/public/scripts
8) Schedule of Classes Scraper - socscraper/
9) Various MongoDB and Node.js files - schedulecmu/


Introduction
--------------
With ScheduleCMU, we intend to bring about a drastic change in the way the
CMU community creates and views academic schedules. Our app, created from
scratch, allows CMU students to plan and view their academic schedules in a
user-friendly manner.

The CourseEvents feature allow students to view and collaboratively add ad-hoc
events related to the courses they are taking, such as office hours or review
sessions. These events will be shown in the calendar of any student who has
added the related course to their list.


How it works
--------------
We made a tool that works well on both mobile devices and desktop clients.
It allows you to sign up with your Facebook account. Then to verify that you
are a CMU student, our app sends a verification email to the user's andrew
email. On clicking the link provided in the email, the user is directed to the
schedules page where he or she can create a schedule. Various buttons on this
page allow you to browse courses by number and department and to add a course
events to a course that you are signed up for.

We have hosted our app on AppFog and it can be accessed on both desktop and
a mobile device at:

http://schedulecmu.aws.af.cm/

Eventually we plan to host this at http://schedulecmu.org.


Features
-------------
Front-end:
- Desktop client
- Mobile client
    - iOS: can be saved as a webclip and used independently of Safari
    - Android: the packaged APK
- Search for courses and add them
- CourseEvents
- Facebook authentication with Andrew email verification

Back-end:
- MongoDB database
- RESTful API
- Scraper of Schedule of Classes (to populate database)

(See GRADING_HELP.md for a more technical list of the features and techniques
 used to implement these features)
