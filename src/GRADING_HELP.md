Grading Help
=============

Group members
--------------
Nivedita Chopra (niveditc)
Madeline Horowitz (mhorowit)
Isaac Lim (idl)
Naman Bharadwaj (nbharadw, not in 237, but approved by Prof. Kosbie)


Time spent
--------------
Nivedita Chopra - 80 hours
Madeline Horowitz - 80 hours
Isaac Lim - 80 hours
Naman Bharadwaj - 80 hours


Required elements
--------------
1. JavaScript
    - schedulecmu/public/scripts/schedule.js
    - socscraper/socscraper.js
    - schedulecmu/public/scripts/login.js
    - The OAuth Facebook JavaScript API in login.js

2. HTML
    - *.html in schedulecmu/public/desktop/
    - *.html in schedulecmu/public/mobile/
    - These have tables, forms, and form validation
      in schedule.js

3. CSS
    - schedulecmu/public/desktop/css/style.css
    - schedulecmu/public/mobile/style.css
    - Includes pseudo-selectors and various
      layout styles

4. DOM manipulation
    - schedulecmu/public/scripts/schedule.js
    - Contents are dynamically injected into the DOM
      using jQuery, throughout both the mobile and 
      desktop clients.
    - socscraper/socscraper.js
    - Using jsDom to scrape Schedule of Classes, and 
      manipulating that "virtual" DOM to dump courses 
      in our database.

5. jQuery
    - schedulecmu/public/scripts/schedule.js
    - Most manipulation is done using jQuery.

6. jQuery Mobile
    - schedulecmu/public/mobile/index.html
    - Our entire mobile client is done in jQuery
      mobile, including page transitions, dialogs,
      forms, and the FullCalendar jQuery plugin (also
      on desktop).

7. AJAX (or similar) client (consume an API)
    - schedulecmu/public/scripts/schedule.js
    - We are consuming our own REST API throughout
      this file. Look at all calls to 
      performAjaxRequest(): a wrapper for $.ajax

8. AJAX (or similar) server (provide an API)
    - schedulecmu/courses_api.js
    - schedulecmu/users_api.js
    - We are serving up our own RESTful API in these
      two files. We have GET, POST, PUT, DELETE 
      methods for all objects in our models.
    - This RESTful API serves up data from our own
      MongoDB database.

9. node.js (express)
    - schedulecmu/app.js
    - schedulecmu/db.js
    - schedulecmu/courses_api.js
    - schedulecmu/users_api.js
    - All calls to app.get, app.post, etc.
    - The plugin nodemailer (schedulecmu/user_model.js)
    - The plugin jsDom (socscraper/socscraper.js).

10. MongoDB and Mongoose
    - schedulecmu/course_model.js
    - schedulecmu/user_model.js
    - Using jsDom and jQuery, scraped HTML files from
      Schedule of Classes, and dumped the data in our
      MongoDB database.
    - Our RESTful API serves up course and user info
      from this database.
