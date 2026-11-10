import { createError } from 'h3'

// Alfabeto de generateCode() em sessions.ts (sem I e O).
const CODE_RE = /^[A-HJ-NP-Z]{4}$/
const VIDEO_ID_RE = /^[\w-]{11}$/
const THUMB_PREFIX = 'https://i.ytimg.com/'

function invalid(field: string): never {
  throw createError({ statusCode: 400, message: `${field} inválido` })
}

// Texto após trim; ausente vira ''. `min` 0 deixa o campo opcional.
function text(value: unknown, field: string, max: number, min = 0): string {
  const v = value ?? ''
  if (typeof v !== 'string') return invalid(field)
  const s = v.trim()
  if (s.length < min || s.length > max) return invalid(field)
  return s
}

export function parseCode(value: unknown): string {
  const code = text(value, 'Código da sala', 4, 4).toUpperCase()
  return CODE_RE.test(code) ? code : invalid('Código da sala')
}

export function parseClientId(value: unknown): string {
  const id = text(value, 'Identificação do cliente', 64, 1)
  // O id vira chave de `session.clients`: nomes de Object.prototype não podem ser aceitos.
  if (id in Object.prototype || id === 'prototype') invalid('Identificação do cliente')
  return id
}

export function parseName(value: unknown): string {
  return text(value, 'Nome', 24, 1)
}

// Pusher socket_id: "<digits>.<digits>".
const SOCKET_ID_RE = /^\d+\.\d+$/

export function parseSocketId(value: unknown): string {
  return typeof value === 'string' && SOCKET_ID_RE.test(value) ? value : invalid('Conexão')
}

export function parseVote(value: unknown): 'like' | 'dislike' {
  return value === 'like' || value === 'dislike' ? value : invalid('Voto')
}

export function parseIds(value: unknown): string[] {
  if (!Array.isArray(value)) return invalid('Ordem da fila')
  return value.map((id) => text(id, 'Ordem da fila', 64, 1))
}

export function parseRequiredSongId(value: unknown): string {
  return text(value, 'Música', 64, 1)
}

export function parseSongId(value: unknown): string | undefined {
  return value == null ? undefined : parseRequiredSongId(value)
}

export function parseSong(body: Record<string, unknown>) {
  const videoId = typeof body.videoId === 'string' ? body.videoId : ''
  if (!VIDEO_ID_RE.test(videoId)) invalid('Vídeo')
  const thumbnail = text(body.thumbnail, 'Thumbnail', 500)
  if (thumbnail && !thumbnail.startsWith(THUMB_PREFIX)) invalid('Thumbnail')
  return {
    videoId,
    title: text(body.title, 'Título', 200),
    artist: text(body.artist, 'Artista', 200),
    thumbnail,
    duration: text(body.duration, 'Duração', 20),
  }
}
