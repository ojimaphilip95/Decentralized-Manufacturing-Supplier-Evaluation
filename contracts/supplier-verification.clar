;; Supplier Verification Contract
;; Validates legitimate component providers

(define-data-var admin principal tx-sender)

;; Supplier status: 1 = verified, 0 = unverified
(define-map suppliers principal uint)

;; Get verification status for a supplier
(define-read-only (get-supplier-status (supplier principal))
  (default-to u0 (map-get? suppliers supplier))
)

;; Check if a supplier is verified
(define-read-only (is-verified (supplier principal))
  (is-eq (get-supplier-status supplier) u1)
)

;; Restrict function to admin only
(define-private (check-admin)
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u403))
    (ok true)
  )
)

;; Verify a supplier
(define-public (verify-supplier (supplier principal))
  (begin
    (try! (check-admin))
    (map-set suppliers supplier u1)
    (ok true)
  )
)

;; Revoke a supplier's verification
(define-public (revoke-supplier (supplier principal))
  (begin
    (try! (check-admin))
    (map-set suppliers supplier u0)
    (ok true)
  )
)

;; Transfer admin rights
(define-public (set-admin (new-admin principal))
  (begin
    (try! (check-admin))
    (var-set admin new-admin)
    (ok true)
  )
)
