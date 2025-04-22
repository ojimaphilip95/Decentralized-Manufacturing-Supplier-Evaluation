;; Performance Criteria Contract
;; Defines quality and delivery metrics

(define-data-var admin principal tx-sender)

;; Criteria types
(define-constant QUALITY u1)
(define-constant DELIVERY u2)
(define-constant PRICE u3)
(define-constant COMMUNICATION u4)

;; Data map to store criteria definitions
(define-map criteria
  uint
  {
    name: (string-ascii 100),
    description: (string-ascii 255),
    weight: uint,  ;; Weight out of 100
    active: bool
  }
)

;; Get the contract admin
(define-read-only (get-admin)
  (var-get admin)
)

;; Check if caller is admin
(define-private (is-admin)
  (is-eq tx-sender (var-get admin))
)

;; Update admin - only current admin can change
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-admin) (err u1))
    (ok (var-set admin new-admin))
  )
)

;; Initialize default criteria
(begin
  (map-set criteria QUALITY {
    name: "Quality",
    description: "Product quality assessment",
    weight: u40,
    active: true
  })
  (map-set criteria DELIVERY {
    name: "Delivery",
    description: "On-time delivery assessment",
    weight: u30,
    active: true
  })
  (map-set criteria PRICE {
    name: "Price",
    description: "Price competitiveness",
    weight: u20,
    active: true
  })
  (map-set criteria COMMUNICATION {
    name: "Communication",
    description: "Responsiveness and clarity",
    weight: u10,
    active: true
  })
)

;; Add or update criteria - only admin can modify
(define-public (set-criteria
  (criteria-id uint)
  (name (string-ascii 100))
  (description (string-ascii 255))
  (weight uint)
  (active bool)
)
  (begin
    (asserts! (is-admin) (err u1))
    (asserts! (<= weight u100) (err u2))

    (map-set criteria criteria-id {
      name: name,
      description: description,
      weight: weight,
      active: active
    })
    (ok true)
  )
)

;; Get criteria details
(define-read-only (get-criteria (criteria-id uint))
  (map-get? criteria criteria-id)
)

;; Check if criteria exists and is active
(define-read-only (is-active-criteria (criteria-id uint))
  (match (map-get? criteria criteria-id)
    criteria-data (get active criteria-data)
    false
  )
)

;; Get criteria weight
(define-read-only (get-weight (criteria-id uint))
  (match (map-get? criteria criteria-id)
    criteria-data (get weight criteria-data)
    u0
  )
)
