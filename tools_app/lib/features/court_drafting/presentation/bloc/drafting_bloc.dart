import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/draft_request_model.dart';
import '../../data/repositories/drafting_repository.dart';

// Events
abstract class DraftingEvent {}

class GenerateDraftEvent extends DraftingEvent {
  final DraftRequest request;
  GenerateDraftEvent(this.request);
}

class SaveDraftEvent extends DraftingEvent {
  final String title;
  final String content;
  SaveDraftEvent({required this.title, required this.content});
}

class ResetDraftEvent extends DraftingEvent {}

// States
abstract class DraftingState {}

class DraftingInitial extends DraftingState {}

class DraftingLoading extends DraftingState {}

class DraftingSuccess extends DraftingState {
  final DraftResponse draft;
  final bool isSaved;
  DraftingSuccess({required this.draft, this.isSaved = false});

  DraftingSuccess copyWith({DraftResponse? draft, bool? isSaved}) {
    return DraftingSuccess(
      draft: draft ?? this.draft,
      isSaved: isSaved ?? this.isSaved,
    );
  }
}

class DraftingError extends DraftingState {
  final String message;
  DraftingError(this.message);
}

// BLoC
class DraftingBloc extends Bloc<DraftingEvent, DraftingState> {
  final DraftingRepository repository;

  DraftingBloc({required this.repository}) : super(DraftingInitial()) {
    on<GenerateDraftEvent>((event, emit) async {
      emit(DraftingLoading());
      try {
        final draft = await repository.generateLegalDraft(event.request);
        emit(DraftingSuccess(draft: draft));
      } catch (e) {
        emit(DraftingError(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<SaveDraftEvent>((event, emit) async {
      if (state is DraftingSuccess) {
        final current = state as DraftingSuccess;
        final ok = await repository.saveDraft(title: event.title, content: event.content);
        if (ok) {
          emit(current.copyWith(isSaved: true));
        }
      }
    });

    on<ResetDraftEvent>((event, emit) {
      emit(DraftingInitial());
    });
  }
}

