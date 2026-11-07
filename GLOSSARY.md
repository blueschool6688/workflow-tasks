# Tasks

Agile project and workflow management: teams plan work in sprints, move tasks through project-defined workflows, and collaborate in real time.

## Structure

**Organization**:
The top-level tenant that owns workspaces.
_Avoid_: Company, tenant

**Workspace**:
A space inside an Organization that groups related projects and has its own members.
_Avoid_: Team, space

**Project**:
A body of work inside a Workspace, identified by a short project key, with its own members, workflow, sprints and chat.
_Avoid_: Board, repo

## Planning

**Epic**:
A large goal that groups many tasks within a Project.
_Avoid_: Initiative, theme

**Sprint**:
A time-boxed cycle (start and end date) with a goal, to which tasks are assigned.
_Avoid_: Iteration, cycle

**Backlog**:
The tasks of a Project that are not assigned to any Sprint.
_Avoid_: Icebox, unscheduled

**Task**:
A unit of work in a Project, numbered within it (`task_number`), with a type, priority, assignee and reporter.
_Avoid_: Issue, ticket, card

**Subtask**:
A Task whose parent is another Task.
_Avoid_: Child task, checklist item

## Workflow

**Workflow**:
The set of statuses and allowed transitions a Project defines for its tasks.
_Avoid_: Pipeline, process

**Status**:
One state in a Workflow; a Task's current position (shown as a Kanban column).
_Avoid_: Column, stage, state

**Transition**:
A permitted move from one Status to another within a Workflow.
_Avoid_: Rule, step

## Collaboration

**Project Member**:
A User belonging to a Project, with a project-level role.
_Avoid_: Participant, collaborator

**Work Log**:
A recorded amount of time a User spent on a Task.
_Avoid_: Timesheet, time entry

**Project Chat**:
The real-time message channel of a Project, supporting threaded replies, pins and attachments.
_Avoid_: Chatbox, comments (comments belong to a Task)

**Comment**:
A message attached to a single Task.
_Avoid_: Note, reply
