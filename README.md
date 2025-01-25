Prompts for the app ‘Plan Wild Success’

I am creating a mission planning application. 

users can register and login and logout and create missions

create a user table with id, email, name, password(encrypted), created and created_by  create a api in react that has CRUD for the user table

create table called mission with id, userid, name, description, created and created_by

Each mission will have mission factors.

There are 6 mission factors:

1. success - example: we got the stuff we wanted from the store 
2. constraint and obstacle - example: car might be out of gas, stolen, gone, broken, card might be blocked, store might be closed, store might not have the things we want, we might get lost, google maps requires data service 
3. relevant fact - example: we have a car, we have money in our bank, we have a debit card for the bank, we have google maps, we have a data plan
4. relevant assumption - example: the car has gas, our phone will not break while going to the store, the car works and is here, we have money and the bank will make it work
5. driver and resource - example: need food from store
6. course of action - example: check car for gas, check store hours, call store if concerned about no food, drive to store, bring money, buy food at store, drive home

if a user creates a mission they are added to the mission participant table the mission participant table has id, missionid, userid, created and created by

Anyone who has an email address can create an account create a mission and add factors or participants to a mission. Any of the 6 factors maybe liked by the any of the participants. 
 create a table called ‘like’ that has id, factorid, userid, and created   
create robust tests using selenium to create accounts, login, create missions, create factors and participants, as a user like factors and participants and unlike factors and participants

make an API for all features and create test scripts to test all the features and keep add new tests
