; Keep the Windows installer sharp on high-DPI displays instead of letting
; Windows bitmap-scale the full NSIS UI.
ManifestDPIAware true

!macro customInstallMode
  StrCpy $isForceCurrentInstall "1"
!macroend

!macro customWelcomePage
  !define MUI_WELCOMEPAGE_TITLE "NgaRingApi"
  !define MUI_WELCOMEPAGE_TEXT "Local-first, git-friendly API IDE and client for modern developers."
  !insertmacro MUI_PAGE_WELCOME
!macroend
