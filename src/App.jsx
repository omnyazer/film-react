import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { addComment, removeComment } from "./redux/commentSlice";
import { Container, Form, Button, Card, Alert } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const schema = yup.object().shape({
  comment: yup
    .string()
    .required("Ce champ est obligatoire")
    .max(500, "500 caractères maximum"),

  note: yup
    .number()
    .typeError("Veuillez sélectionner une note")
    .required("Veuillez sélectionner une note")
    .min(1, "Veuillez sélectionner une note")
    .max(5, "Veuillez sélectionner une note"),

  acceptConditions: yup
    .boolean()
    .oneOf([true], "Vous devez accepter les conditions générales")
});

const App = () => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const comments = useSelector((state) => state.comments.comments);
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://jsonfakery.com/movies/random/1");
        if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
        const data = await res.json();
        const movieData = data[0];
        const transformedMovie = {
          title: movieData.original_title,
          description: movieData.overview,
          poster: movieData.poster_path,
          year: movieData.release_date || "Inconnue"
        };
        setMovie(transformedMovie);
      } catch (err) {
        setError("Impossible de charger le film.");
        console.error("Erreur film :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, []);

  const onSubmit = (data) => {
    dispatch(
      addComment({
        id: Date.now(),
        comment: data.comment,
        note: data.note
      })
    );
    reset();
  };

  return (
    <Container className="mt-4 container-centered">
      {loading && <p>Chargement du film...</p>}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && movie && (
        <Card className="movie-card mb-4">
          {movie.poster && (
            <Card.Img
              variant="top"
              src={movie.poster}
              alt={movie.title || "Affiche du film"}
              className="movie-poster"
            />
          )}
          <Card.Body>
            <Card.Title>{movie.title || "Titre non disponible"}</Card.Title>
            <Card.Text>{movie.description || "Description non disponible."}</Card.Text>
            <Card.Text>
              <strong>Année :</strong> {movie.year}
            </Card.Text>
          </Card.Body>
        </Card>
      )}

      <h3>Commentaires</h3>
      <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
        <Form.Group className="mb-3">
          <Form.Label>Ajouter un commentaire</Form.Label>
          <Form.Control as="textarea" rows={3} {...register("comment")} />
          {errors.comment && <p className="text-danger">{errors.comment.message}</p>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Note</Form.Label>
          <Form.Select {...register("note")}>
            <option value="">Sélectionnez une note</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </Form.Select>
          {errors.note && <p className="text-danger">{errors.note.message}</p>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="J'accepte les conditions générales"
            {...register("acceptConditions")}
          />
          {errors.acceptConditions && (
            <p className="text-danger">{errors.acceptConditions.message}</p>
          )}
        </Form.Group>

        <Button type="submit">Ajouter</Button>
      </Form>

      {comments.length === 0 ? (
        <Alert variant="info">Aucun commentaire pour le moment.</Alert>
      ) : (
        comments.map((c) => (
          <Card key={c.id} className="mb-2">
            <Card.Body>
              <Card.Text>{c.comment}</Card.Text>
              <Card.Text>
                <strong>Note :</strong> {c.note} / 5
              </Card.Text>
              <Button
                variant="danger"
                size="sm"
                onClick={() => dispatch(removeComment(c.id))}
              >
                Supprimer
              </Button>
            </Card.Body>
          </Card>
        ))
      )}
    </Container>
  );
};

export default App;
