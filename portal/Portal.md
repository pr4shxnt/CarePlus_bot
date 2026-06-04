# Admin Portal

1 - Shows users
2 - approves kyc of users (mannual)
3 - doctor license verification (mannual)
4 - CRUD Doctors
5 - CRUD Patients
6 - view reports of patients (only view, no edit or delete or create)

## ADD : a is_verified boolean in users schema in the backend and default should be false.

## Theme: ShadCN UI, dashboard must be premium, modern and clean, professional looking

use exactly the same sidebar as of shadcn and also the dashboard too, that shows the trends charts etc.

## Tech Stack: ReactJS, tailwindcss, TypeScript, shadcnUI, shadcn-dnd



## Auth:
JWT based authentication : when I am logged in "/login" should redirect to "/dashboard" and "/dashboard" should redirect to "/login" if not logged in.
Base route: "/" should always redirect to "/dashboard" if logged in and to "/login" if not logged in.

