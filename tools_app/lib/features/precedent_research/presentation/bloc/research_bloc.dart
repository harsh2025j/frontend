import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/precedent_model.dart';
import '../../data/repositories/research_repository.dart';

// Events
abstract class ResearchEvent {}

class SearchPrecedentsEvent extends ResearchEvent {
  final String query;
  final String? court;
  final String? year;

  SearchPrecedentsEvent({required this.query, this.court, this.year});
}

class ClearResearchEvent extends ResearchEvent {}

// States
abstract class ResearchState {}

class ResearchInitial extends ResearchState {}

class ResearchLoading extends ResearchState {}

class ResearchLoaded extends ResearchState {
  final List<Precedent> precedents;
  final String query;
  final String? court;

  ResearchLoaded({
    required this.precedents,
    required this.query,
    this.court,
  });
}

class ResearchError extends ResearchState {
  final String message;
  ResearchError(this.message);
}

// BLoC
class ResearchBloc extends Bloc<ResearchEvent, ResearchState> {
  final ResearchRepository repository;

  ResearchBloc({required this.repository}) : super(ResearchInitial()) {
    on<SearchPrecedentsEvent>((event, emit) async {
      if (event.query.trim().isEmpty) return;
      emit(ResearchLoading());
      try {
        final results = await repository.searchPrecedents(
          query: event.query,
          court: event.court,
          year: event.year,
        );
        emit(ResearchLoaded(
          precedents: results,
          query: event.query,
          court: event.court,
        ));
      } catch (e) {
        emit(ResearchError(e.toString().replaceAll('Exception: ', '')));
      }
    });

    on<ClearResearchEvent>((event, emit) {
      emit(ResearchInitial());
    });
  }
}

