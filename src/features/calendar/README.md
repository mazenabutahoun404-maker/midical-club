# Calendar — V0.3

Implemented at /my/calendar: month/agenda views, illustrative course dates, saved events/deadlines, and personal study block creation, editing and deletion. Keyboard arrows move the date cursor. All displayed times use Amman time.

useCalendar composes service records with workspace state. Data models live in types/workspace.ts; date composition lives in lib/calendar.ts. The stable demo anchor is constants/config.ts. There is no registration engine or background alert delivery.
