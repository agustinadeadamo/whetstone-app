import { relations, sql } from 'drizzle-orm';
import {
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';

// `users` is the mirror table in the public schema. Rows are inserted via a
// trigger from `auth.users` on signup (defined with the RLS policies in a
// later sub-step), so `id` deliberately has no defaultRandom — it must match
// the auth user id.
export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const decks = pgTable('decks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const modules = pgTable('modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  deckId: uuid('deck_id')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  number: integer('number').notNull(),
  title: text('title').notNull(),
  shortLabel: text('short_label'),
  color: text('color'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const questions = pgTable(
  'questions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id')
      .notNull()
      .references(() => modules.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull().default('question'),
    prompt: text('prompt').notNull(),
    modelAnswer: text('model_answer').notNull(),
    shortAnswer: text('short_answer'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check('questions_kind_check', sql`${t.kind} in ('question', 'term')`),
  ],
);

export const progress = pgTable(
  'progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    questionId: uuid('question_id')
      .notNull()
      .references(() => questions.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('new'),
    timesSeen: integer('times_seen').notNull().default(0),
    timesCorrect: integer('times_correct').notNull().default(0),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  },
  (t) => [
    check(
      'progress_status_check',
      sql`${t.status} in ('new', 'weak', 'learning', 'mastered')`,
    ),
    unique('progress_user_question_unique').on(t.userId, t.questionId),
  ],
);

export const evaluations = pgTable('evaluations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id')
    .notNull()
    .references(() => questions.id, { onDelete: 'cascade' }),
  userAnswer: text('user_answer').notNull(),
  score: integer('score').notNull(),
  covered: jsonb('covered').$type<string[]>().notNull(),
  missing: jsonb('missing').$type<string[]>().notNull(),
  tip: text('tip').notNull(),
  latencyMs: integer('latency_ms').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usageCounters = pgTable(
  'usage_counters',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    period: text('period').notNull(),
    aiGrades: integer('ai_grades').notNull().default(0),
  },
  (t) => [unique('usage_counters_user_period_unique').on(t.userId, t.period)],
);

// --- Relations (typed relational query API) -------------------------------

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  progress: many(progress),
  evaluations: many(evaluations),
  usageCounters: many(usageCounters),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  modules: many(modules),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  deck: one(decks, {
    fields: [modules.deckId],
    references: [decks.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  module: one(modules, {
    fields: [questions.moduleId],
    references: [modules.id],
  }),
  progress: many(progress),
  evaluations: many(evaluations),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  user: one(users, {
    fields: [progress.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [progress.questionId],
    references: [questions.id],
  }),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  user: one(users, {
    fields: [evaluations.userId],
    references: [users.id],
  }),
  question: one(questions, {
    fields: [evaluations.questionId],
    references: [questions.id],
  }),
}));

export const usageCountersRelations = relations(usageCounters, ({ one }) => ({
  user: one(users, {
    fields: [usageCounters.userId],
    references: [users.id],
  }),
}));
