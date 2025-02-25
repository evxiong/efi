# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning is as follows:

- Major version number incremented when UI or underlying model significantly
  changes
- Minor version number incremented when new features added

## [Unreleased]

### Planned for [1.1] ~ Apr. 2025

#### Additions

- Support for three more European leagues: Liga Portugal, Eredivisie, Belgian
  Pro League.
- Ratings factor in relative league strength.
- Power rankings across all leagues.

### Planned for [1.2] ~ May 2025

#### Additions

- Support for UEFA Champions League, Europa League, and Conference League.
- (Potential) Support for non-European leagues such as MLS, Brasileirão, and/or
  Liga MX.

## [1.0] - 2025-02-25

### Added

- Support for Big 5 European leagues: Premier League, LaLiga, Serie A,
  Bundesliga, Ligue 1.
- League-specific ratings; relative league strength is not yet factored into
  model.

### Fixed

- Multiclass Brier score formula in scoring module and README.

### Changed

- UI revamp.
- Name changed from PLFI to EFI.

## [0.1] - 2025-02-08

### Added

- Support for Premier League only.

[0.1]: https://github.com/evxiong/efi/releases/tag/v0.1
[1.0]: https://github.com/evxiong/efi/compare/v0.1...v1.0
[unreleased]: https://github.com/evxiong/efi/compare/v1.0...HEAD
