;; Evaluation Tracking Contract
;; Records supplier performance over time

(define-data-var admin principal tx-sender)

;; Define evaluation data structure
(define-map evaluations
  {
    supplier: principal,
    period: uint,      ;; e.g., year-month as 202401
    criteria-id: uint
  }
  {
    evaluator: principal,
    score: uint,       ;; score from 0-100
    timestamp: uint,
    comments: (string-ascii 255)
  }
)

;; Track total evaluations per supplier per period
(define-map evaluation-counts
  { supplier: principal, period: uint }
  { count: uint }
)

;; Get the contract admin
(define-read-only (get-admin)
  (var-get admin)
)

;; Check if caller is admin or authorized evaluator
(define-private (is-authorized)
  (is-eq tx-sender (var-get admin))
  ;; Additional authorization logic could be added here
)

;; Update admin - only current admin can change
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (ok (var-set admin new-admin))
  )
)

;; Add a new evaluation for a supplier
(define-public (add-evaluation
  (supplier principal)
  (period uint)
  (criteria-id uint)
  (score uint)
  (comments (string-ascii 255))
)
  (begin
    (asserts! (is-authorized) (err u1))
    (asserts! (<= score u100) (err u2))

    ;; Increment evaluation count
    (map-set evaluation-counts
      { supplier: supplier, period: period }
      { count: (+ u1 (get-evaluation-count supplier period)) }
    )

    ;; Store the evaluation
    (map-set evaluations
      { supplier: supplier, period: period, criteria-id: criteria-id }
      {
        evaluator: tx-sender,
        score: score,
        timestamp: block-height,
        comments: comments
      }
    )
    (ok true)
  )
)

;; Get a specific evaluation
(define-read-only (get-evaluation (supplier principal) (period uint) (criteria-id uint))
  (map-get? evaluations { supplier: supplier, period: period, criteria-id: criteria-id })
)

;; Get evaluation count for a supplier in a period
(define-read-only (get-evaluation-count (supplier principal) (period uint))
  (match (map-get? evaluation-counts { supplier: supplier, period: period })
    count-data (get count count-data)
    u0
  )
)

;; Update an existing evaluation - only admin can modify
(define-public (update-evaluation
  (supplier principal)
  (period uint)
  (criteria-id uint)
  (score uint)
  (comments (string-ascii 255))
)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u1))
    (asserts! (<= score u100) (err u2))
    (asserts! (is-some (map-get? evaluations { supplier: supplier, period: period, criteria-id: criteria-id })) (err u3))

    (map-set evaluations
      { supplier: supplier, period: period, criteria-id: criteria-id }
      {
        evaluator: tx-sender,
        score: score,
        timestamp: block-height,
        comments: comments
      }
    )
    (ok true)
  )
)
