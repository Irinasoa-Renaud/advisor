import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Grid, Paper } from '@material-ui/core';
import { useAuth } from '../../providers/authentication';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    media: {
        height: 140,
    },
}));

interface DashboardProps {
    dashboardDay: number,
    dashboardWeek: number,
    dashboardMonth: number,
    dashboardYear: number,
    chiffreAffaireDay: number,
    chiffreAffaireWeek: number,
    chiffreAffaireMonth: number,
    chiffreAffaireYear: number,
    BestRestoDayName: string,
    BestRestoSomme: number,
    BestRestoCommande: number,
    BestRestoWeekName: string,
    BestRestoWeekSomme: number,
    BestRestoWeekCommande: number,
    BestRestoMonthName: string,
    BestRestoMonthSomme: number,
    BestRestoMonthCommande: number,
    BestRestoYearName: string,
    BestRestoYearSomme: number,
    BestRestoYearCommande: number
}

const MediaCard: React.FC<DashboardProps> = ({
    dashboardDay,
    dashboardWeek,
    dashboardMonth,
    dashboardYear,
    chiffreAffaireDay,
    chiffreAffaireWeek,
    chiffreAffaireMonth,
    chiffreAffaireYear,
    BestRestoDayName,
    BestRestoSomme,
    BestRestoCommande,
    BestRestoWeekName,
    BestRestoWeekSomme,
    BestRestoWeekCommande,
    BestRestoMonthName,
    BestRestoMonthSomme,
    BestRestoMonthCommande,
    BestRestoYearName,
    BestRestoYearSomme,
    BestRestoYearCommande
}) => {
    const classes = useStyles();

    const { isAdmin } = useAuth();

    return (
        <Paper className={classes.root}>
            <h2>Nombre de commandes</h2>
            <Grid container spacing={2} >
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Aujourd'hui: {dashboardDay}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cette semaine: {dashboardWeek}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cet mois: {dashboardMonth}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cette annee: {dashboardYear}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            <h2>Chiffre d'affaire</h2>
            <Grid container spacing={2} >
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Aujourd'hui: {chiffreAffaireDay / 100}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cette semaine: {chiffreAffaireWeek / 100}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cet mois: {chiffreAffaireMonth / 100}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
                <Grid item xs={6} sm={3}>
                    <Card className={classes.root}>
                        <CardActionArea>
                            <CardContent>
                                <Typography gutterBottom variant="h5" component="h2">
                                    <span>Cette annee: {chiffreAffaireYear / 100}</span>
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            </Grid>

            {
                isAdmin && (
                    <div>
                        <h2>Meilleur Restaurant</h2>
                        <Grid container spacing={2} >
                            <Grid container spacing={2} sm={12}>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Aujourd'hui: {BestRestoDayName}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Nombre commande total: {BestRestoCommande}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Total : {BestRestoSomme ? BestRestoSomme / 100 : 0}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sm={12}>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Cette semaine: {BestRestoWeekName}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Nombre commande total: {BestRestoWeekCommande}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Total : {BestRestoWeekSomme ? BestRestoWeekSomme / 100 : 0}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sm={12}>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Cette mois: {BestRestoMonthName}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Nombre commande total: {BestRestoMonthCommande}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Total : {BestRestoMonthSomme ? BestRestoMonthSomme / 100 : 0}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Grid container spacing={2} sm={12}>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Cette annee: {BestRestoYearName}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Nombre commande total: {BestRestoYearCommande}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} sm={4}>
                                    <Card className={classes.root}>
                                        <CardActionArea>
                                            <CardContent>
                                                <Typography gutterBottom variant="h5" component="h2">
                                                    <span>Total : {BestRestoYearSomme ? BestRestoYearSomme / 100 : 0}</span>
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            </Grid>

                        </Grid>

                    </div>
                )
            }
        </Paper>
    );
}

export default MediaCard
